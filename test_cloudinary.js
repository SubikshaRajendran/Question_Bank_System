const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dqi4crgop',
    api_key: '862391676162651',
    api_secret: 'fMg_2vRP_5NCLTeLuM56SxSjuUQ'
});

console.log("Testing Cloudinary Connection...");

cloudinary.api.ping((error, result) => {
    if (error) {
        console.error("Connection Failed:", error);
    } else {
        console.log("Connection Successful:", result);
    }
});
