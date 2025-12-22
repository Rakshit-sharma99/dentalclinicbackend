const express = require('express');
const router = express.Router();

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

router.get('/', (req, res) => {
    // Directly return mock reviews as per user request
    console.log("Serving Mock Reviews (Google API disabled).");
    return res.json(MOCK_REVIEWS);
});

module.exports = router;
