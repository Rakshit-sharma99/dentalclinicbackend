const express = require('express');
const router = express.Router();
const axios = require('axios');

// Mock data as fallback
const MOCK_REVIEWS = [
    {
        author_name: "Aarav Patel",
        text: "Absolutely the best dental experience I've ever had. The futuristic design of the clinic reflects their cutting-edge technology.",
        rating: 5,
        profile_photo_url: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
        author_name: "Sanya Sharma",
        text: "Dr. Singh was incredibly gentle. I didn't feel a thing during my root canal. Highly recommend!",
        rating: 5,
        profile_photo_url: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
        author_name: "Rohan Gupta",
        text: "Love the appointment system! No waiting, no hassle. The staff is super professional and the vibe is amazing.",
        rating: 5,
        profile_photo_url: "https://randomuser.me/api/portraits/men/85.jpg"
    },
    {
        author_name: "Meera Reddy",
        text: "My teeth whitening results are stunning. I can't stop smiling! Thank you for the confidence boost.",
        rating: 5,
        profile_photo_url: "https://randomuser.me/api/portraits/women/68.jpg"
    },
    {
        author_name: "Vikram Malhotra",
        text: "A true 5-star experience. From the reception to the chair, everything feels premium and well-cared for.",
        rating: 5,
        profile_photo_url: "https://randomuser.me/api/portraits/men/22.jpg"
    },
    {
        author_name: "Ananya Desai",
        text: "Finally found a dentist I trust. They explained everything clearly and didn't push unnecessary treatments.",
        rating: 5,
        profile_photo_url: "https://randomuser.me/api/portraits/women/12.jpg"
    }
];

router.get('/', async (req, res) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    if (!apiKey || !placeId) {
        console.warn("Missing Google API Key or Place ID. Returning mock reviews.");
        return res.json(MOCK_REVIEWS);
    }

    try {
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`
        );

        if (response.data.status === 'OK' && response.data.result.reviews) {
            // Transform Google data to match our component expectation if needed
            // Or just return the raw reviews array. Component expects: name, text, rating, image (profile_photo_url)
            // Google gives: author_name, text, rating, profile_photo_url
            // Matches fairly well.
            console.log("Fetched reviews from Google API.");
            return res.json(response.data.result.reviews);
        } else {
            console.error("Google API Error or No Reviews:", response.data);
            return res.json(MOCK_REVIEWS); // Fallback
        }
    } catch (error) {
        console.error("Failed to fetch Google Reviews:", error.message);
        return res.json(MOCK_REVIEWS); // Fallback to mock data on network error
    }
});

module.exports = router;
