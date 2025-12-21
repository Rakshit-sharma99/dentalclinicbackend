const nodemailer = require("nodemailer");

const KEY = "xsmtpsib-a13b42f890505de43ad80ef6e4bd03cf63fd28b2bd5993300642610c9b1f879f-R5VoxDR6jXhB8aeD";
const USERS_TO_TRY = [
    "apikey",
    "mdclinicjalandhar@gmail.com",
    "rakshitsharma5269@gmail.com",
    "no-reply@moderndentalclinicphagwra.com"
];

async function testUser(user) {
    console.log(`\n🔍 Testing User: '${user}'...`);

    const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: {
            user: user,
            pass: KEY,
        },
    });

    try {
        await transporter.verify();
        console.log(`✅✅✅ SUCCESS! Working Login: ${user}`);
        return true;
    } catch (err) {
        if (err.responseCode === 535) {
            console.log(`❌ Auth Failed (535)`);
        } else {
            console.log(`❌ Error: ${err.message}`);
        }
        return false;
    }
}

async function run() {
    for (const user of USERS_TO_TRY) {
        if (await testUser(user)) break;
    }
}

run();
