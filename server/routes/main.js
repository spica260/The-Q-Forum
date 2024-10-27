const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const aLayout = '../views/layouts/auth';
const jwtSecret = process.env.JWT_SECRET;

// GET Home Page
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

// GET Login
router.get('/auth', async (req, res) => {
  
    try {
        const locals = {
            title: "The Q Forum",
            description: "User Page For The Q Forum."
        }

        res.render('auth/login', {
          locals,
          layout: aLayout });

    } catch(error) {
        console.log(error);
    }
});

// POST login
router.post('/auth', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await User.findOne( { username } );
  
      if(!user) {
        return res.status(401).send('Invalid credentials');
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if(!isPasswordValid) {
        return res.status(401).send('Invalid credentials');
      }
  
      const token = jwt.sign({ userId: user._id}, jwtSecret );
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/');
  
    } catch (error) {
      console.log(error);
    }
  });

module.exports = router;