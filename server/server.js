'use strict';

//Require express
const express = require('express');
//Require a logging middleware that is useful for debugging purposes: morgan
const morgan = require('morgan');
//Require passport
const passport = require('passport');
//Require LocalStrategy for authentication with username and password
const LocalStrategy = require('passport-local').Strategy;
//Require session
const session = require('express-session');
//Require express-validator which is used to perform validation
const { body, validationResult, param } = require('express-validator');

// init express
const app = new express();
const PORT = 3001;
app.use(morgan('dev'));
app.use(express.json());

//Require the dao module for accessing users in DB
const userDao = require('./user-dao');
//Require the dao module for accessing images in DB
const imageDao = require('./image-dao');
//Require the dao module for accessing memes in DB
const memeDao = require('./meme-dao')

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
    function (username, password, done) {
        userDao.getUser(username, password).then((user) => {
            if (!user)
                return done(null, false, { message: 'Incorrect username and/or password.' });

            return done(null, user);
        })
    }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
    userDao.getUserById(id)
        .then(user => {
            done(null, user); // this will be available in req.user
        }).catch(err => {
            done(err, null);
        });
});

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated())
        return next();

    return res.status(401).json({ error: 'not authenticated' });
}

// set up the session
app.use(session({
    // by default, Passport uses a MemoryStore to keep track of the sessions
    //a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie
    secret: '0Ws0TQxSueD0eFNepQgrsE1j5RMU68xB89wOkgANHGAS4RwomWhYiX031QmrOqqT5B8GJ8nPmVHusvDuxVyWp1zZmTL$EdWqP2e4htDjDZabw0YOrAaam6w0pt7LkZcL',
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: 'strict'
    }
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

/*** STATIC CONTENT ***/
//Serving static requests
app.use('/static', express.static('public'))

/*** Users APIs ***/

// POST /api/sessions 
// login
app.post('/api/sessions', function (req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            // display wrong login messages
            return res.status(401).json(info);
        }
        // success, perform the login
        req.login(user, (err) => {
            if (err)
                return next(err);

            // req.user contains the authenticated user, we send all the user info back
            // this is coming from userDao.getUser()
            return res.json(req.user);
        });
    })(req, res, next);
});

// DELETE /api/sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
    req.logout();
    res.end();
});

// GET /api/sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    }
    else
        res.status(401).json({ error: 'Unauthenticated user!' });
});

/*** MEMES APIs ***/

//GET: Retrieve all memes from db
app.get('/api/memes', isLoggedIn, (req, res) => {
    memeDao.retrieveAll()
        .then(memes => res.status(200).json(memes))
        .catch(err => res.status(500).json(err));
});

//GET: Retrieve all PUBLIC memes from db.
app.get('/api/memes/filter=public', (req, res) => {
    memeDao.retrieveOnlyPublic()
        .then(memes => res.status(200).json(memes))
        .catch(err => res.status(500).json(err));
});

//POST: Save a new meme into the db.
app.post('/api/memes', isLoggedIn, async (req, res) => {
    //Perform validation. withMessage is used to print custom error messages. bail is used to block the chain of validation when it has already failed.
    await Promise.all([
        //Description must be a string of at least 5 chars
        body('title').isString().withMessage("Must be a string").bail().isLength({ min: 5 }).withMessage("Must be at least 5 chars long").run(req),
        //Important must be a boolean
        body('imageId').isInt().withMessage("Must be an integer").run(req),
        body(['sentence1', 'sentence2', 'sentence3']).custom(() => {
            if (typeof (req.body.sentence1) === 'string' && typeof (req.body.sentence2) === 'string' && typeof (req.body.sentence3) === 'string' &&
                (req.body.sentence1 !== "" || req.body.sentence2 !== "" || req.body.sentence3 !== ""))
                return true;
            else
                return false;
        }).withMessage("Sentences must be strings and at least one of them must be non-empty").run(req),
        body(['cssFontClass', 'cssColourClass']).isString().withMessage("Must be a string").run(req),
        body('prot').isBoolean().withMessage("Must be a boolean (true/false)").run(req)
    ]);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //If there are errors then return status 422 and the object with the array of errors
        return res.status(422).json({ errors: errors.array() });
    }
    memeDao.insertMeme(req.body, req.user.id)
        .then(memeId => res.status(201)
            .set({ "Location": `http://localhost:${PORT}/api/memes/${memeId}` })
            .json({ "id of the new meme": memeId, "outcome": "success, see Location header for the location of the new resource" }))
        .catch(err => res.status(500).json(err));
});

//DELETE: Delete an existing meme from the db.
app.delete('/api/memes/:id', isLoggedIn, async (req, res) => {
    //Id must be an integer
    await param('id').isInt().withMessage("Must be an integer value").run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //If there are errors then return status 404 and the object with the array of errors
        return res.status(404).json({ errors: errors.array() });
    }
    memeDao.deleteByID(req.params.id, req.user.id)
        .then(() => res.status(200).json({ "id of the deleted meme": req.params.id, "outcome": "success" }))
        .catch(err => {
            if (err.errors)
                res.status(404).json(err);
            else
                res.status(500).json(err);
        });
});

/*** IMAGES APIs ***/

//GET: Retrieve all images from db
app.get('/api/images', isLoggedIn, (req, res) => {
    imageDao.retrieveAll()
        .then(images => res.status(200).json(images))
        .catch(err => res.status(500).json(err));
});

// activate the server
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});