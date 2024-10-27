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

// GET Add Question
router.get('/add-qn', authMiddleware, async (req, res) => {
    try {
        const locals = {
          title: 'Add New Question',
          description: 'The Q Forum.'
        }
        
        const data = await Question.find();
        res.render('auth/add-qn', {
          locals,
          data,
          layout: aLayout
        });
    
      } catch (error) {
        console.log(error);
      }
});

// POST Add Question
router.post('/add-qn', authMiddleware, async (req, res) => {
  try {
    try {
      const newQuestion = new Question({
        question: req.body.question,
        category: req.body.category,
        reply: req.body.reply
      });

      await Question.create(newQuestion);
      res.redirect('/categories/food');
    } catch (error) {
      console.log(error);
    }

  } catch (error) {
    console.log(error);
  }
});

// GET Add Reply
router.get('/add-reply/:id', authMiddleware, async (req, res) => {
    try {
      
    const locals = {
      title: "Replies",
      description: "The Q Forum.",
    };

    const data = await Question.findOne({ _id: req.params.id });

    res.render('auth/add-reply', {
      locals,
      data,
      layout: aLayout
    })

  } catch (error) {
    console.log(error);
  }

});

// PUT Add Reply
router.put('/add-reply/:id', authMiddleware, async (req, res) => {
  try {
    
    await Question.findByIdAndUpdate(req.params.id, {
      question: req.body.question,
      category: req.body.category,
      reply: req.body.reply,
      createdAt: Date.now()
    });

    res.redirect(`/question/${req.params.id}`);

  } catch (error) {
    console.log(error);
  }

});

// Delete question
router.delete('/delete-question/:id', authMiddleware, async (req, res) => {
  
  try {
    await Question.deleteOne( { _id: req.params.id } );
    res.redirect('/categories/food');
  } catch (error) {
    console.log(error);
  }

});

module.exports = router;