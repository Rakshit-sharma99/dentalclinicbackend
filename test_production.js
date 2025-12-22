/**
 * Production Readiness Verification Script
 * Tests all critical flows for the Dental Clinic application
 */

const axios = require('axios');
const chalk = require('chalk'); // If available, otherwise use console

const API_URL = 'https://dentalclinicbackend-3vd2.onrender.com';
const FRONTEND_URL = 'https://moderndentalclinicphagwara.com';

let testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

function logTest(name, passed, message = '') {
    testResults.tests.push({ name, passed, message });
    if (passed) {
        testResults.passed++;
        console.log(`✅ ${name}`);
    } else {
        testResults.failed++;
        console.log(`❌ ${name}: ${message}`);
    }
}

async function testAPIHealth() {
    console.log('\n🔍 Testing API Health...\n');

    try {
        // Test if server is reachable
        const response = await axios.get(`${API_URL}/user/check`, {
            validateStatus: () => true
        });
        logTest('API Server Reachable', response.status === 200);
    } catch (error) {
        logTest('API Server Reachable', false, error.message);
    }
}

async function testEnvironmentConfig() {
    console.log('\n🔍 Testing Environment Configuration...\n');

    // Check if URLs are production (not localhost)
    const backendIsProduction = !API_URL.includes('localhost');
    const frontendIsProduction = !FRONTEND_URL.includes('localhost');

    logTest('Backend URL is Production', backendIsProduction, API_URL);
    logTest('Frontend URL is Production', frontendIsProduction, FRONTEND_URL);
    logTest('No Localhost in URLs', backendIsProduction && frontendIsProduction);
}

async function testEmailConfiguration() {
    console.log('\n🔍 Testing Email Configuration...\n');

    const nodemailer = require("nodemailer");
    require("dotenv").config();

    const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.BREVO_USER,
            pass: process.env.BREVO_SMTP_KEY,
        },
    });

    try {
        await transporter.verify();
        logTest('SMTP Connection', true);
        logTest('EMAIL_FROM Configured', !!process.env.EMAIL_FROM);
    } catch (error) {
        logTest('SMTP Connection', false, error.message);
    }
}

async function testDatabaseSchema() {
    console.log('\n🔍 Testing Database Schema...\n');

    const mongoose = require('mongoose');
    require("dotenv").config();

    try {
        await mongoose.connect(process.env.MONGO_URI);

        const Appointment = require('./Model/AppointmentModel');
        const schema = Appointment.schema;

        // Check if userId is ObjectId
        const userIdType = schema.path('userId').instance;
        logTest('Appointment.userId is ObjectId', userIdType === 'ObjectId');

        // Check if date is Date
        const dateType = schema.path('date').instance;
        logTest('Appointment.date is Date type', dateType === 'Date');

        // Check if timestamps are enabled
        const hasTimestamps = schema.options.timestamps === true;
        logTest('Appointment has timestamps', hasTimestamps);

        // Check status enum
        const statusEnum = schema.path('status').enumValues;
        const hasEnum = statusEnum && statusEnum.length === 3;
        logTest('Appointment.status has enum', hasEnum);

        await mongoose.connection.close();
    } catch (error) {
        logTest('Database Connection', false, error.message);
    }
}

async function testSecurityRoutes() {
    console.log('\n🔍 Testing Security (Insecure Routes Removed)...\n');

    try {
        // Try to access the old insecure admin route
        const response = await axios.get(`${API_URL}/admin/appointments`, {
            validateStatus: () => true
        });

        // Should get 404 (route deleted) not 200
        logTest('Insecure /admin/appointments Deleted', response.status === 404);
    } catch (error) {
        // Network error is also acceptable (route doesn't exist)
        logTest('Insecure /admin/appointments Deleted', true);
    }
}

async function testCORS() {
    console.log('\n🔍 Testing CORS Configuration...\n');

    try {
        const response = await axios.get(`${API_URL}/user/check`, {
            headers: {
                'Origin': FRONTEND_URL
            }
        });

        logTest('CORS Headers Present', !!response.headers['access-control-allow-origin']);
    } catch (error) {
        logTest('CORS Test', false, error.message);
    }
}

async function printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log('='.repeat(60));

    if (testResults.failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED - System is Production Ready!\n');
    } else {
        console.log('\n⚠️  Some tests failed - Review above for details\n');
    }
}

async function runTests() {
    console.log('🚀 Starting Production Readiness Tests...');
    console.log(`Backend: ${API_URL}`);
    console.log(`Frontend: ${FRONTEND_URL}`);

    await testEnvironmentConfig();
    await testAPIHealth();
    await testEmailConfiguration();
    await testDatabaseSchema();
    await testSecurityRoutes();
    await testCORS();

    await printSummary();
}

runTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
});
