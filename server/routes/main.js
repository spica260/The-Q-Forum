const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const aLayout = '../views/layouts/auth-header';
const jwtSecret = process.env.JWT_SECRET;

// middleware
const authMiddleware = (req, res, next ) => {
    const token = req.cookies.token;
  
    if(!token) {
      return res.status(401).send('Unauthorized');
    }
  
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.userId = decoded.userId;
      next();
    } catch(error) {
      res.status(401).send('Unauthorized');
    }
  }

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
router.get('/login', async (req, res) => {
  
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
router.post('/auth/login', async (req, res) => {
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
      res.redirect('/dashboard');
  
    } catch (error) {
      console.log(error);
    }
  });

  // GET Register
router.get('/register', async (req, res) => {
  
    try {
        const locals = {
            title: "Register",
            description: "Register Page For The Q Forum."
        }
  
        res.render('auth/register', { locals });
  
    } catch(error) {
        console.log(error);
    }
  });
  
  // POST register
  router.post('/register', async (req, res) => {
    
      try {
          const { username, password } = req.body;
          const hashedPassword = await bcrypt.hash(password, 10);
  
          try {
              const user = await User.create({ username, password:hashedPassword });
              res.redirect('/login');
          } catch (error) {
              if(error.code === 11000) {
                  res.status(409).send('User already in use.');
              }
              res.status(500).send('Internal server error.')
          }
  
      } catch(error) {
          console.log(error);
      }
  });
  
  // GET logout
  router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
  });  

// GET Dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  
    try {
        const locals = {
          title: 'Dashboard - The Q Forum',
          description: 'Dashboard for users of The Q Forum.'
        }
    
        const data = await Question.find();

        res.render('auth/dashboard', {
          locals,
          data,
          layout: aLayout
        });
    
      } catch (error) {
        console.log(error);
      }
});

// GET Categories route
router.get('/categories/food', authMiddleware, async (req, res) => {
  
    try {
        const locals = {
          title: 'Dashboard - The Q Forum',
          description: 'Dashboard for users of The Q Forum'
        }
    
        const data = await Question.find();
        
        res.render('auth/categories/food', {
          locals,
          data,
          layout: aLayout
        });
    
      } catch (error) {
        console.log(error);
      }
  });

// GET Questions Route
router.get('/question/:id', async (req, res) => {
   try {
        let slug = req.params.id;
 
        const data = await Question.findById({ _id: slug });
 
        const locals = {
            title: data.question,
            description: "The Q Forum.",
        };

        res.render('auth/question', { 
            locals,
            data,
            currentRoute: `/auth/question/${slug}`
        });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;