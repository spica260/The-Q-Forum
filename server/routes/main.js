const express = require('express');
const router = express.Router();

router.get('', (req, res) => {

    try {
        const locals = {
            title: "The Q Forum",
            description: "A Simple Q/A Forum with NodeJs."
        }

        res.render('index', { locals });

    } catch (error) {
        console.log(error);
    }
});

module.exports = router;