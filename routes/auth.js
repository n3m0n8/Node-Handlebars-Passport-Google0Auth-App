
//import express as express const
const express = require ('express');
//import passport
const passport = require('passport'); 
///instantiate a router from expressss via express' router () meth
const router = express.Router();

// Authenticate with google
//GET /auth/google
    router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

//Google Auth callback route
//GET /auth/google/callback
    router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (request, response)=>{
            response.redirect('/dashboard');
        }); // IMPORTANT, the function is (req,res) - its an anonymous function that comes in as arg2 of the passport authenticate(meth) and takes the two aspects of the http object instance i.e. the request object and the response object... the redirect method is not a separate further method in an arg3, but rather within the block of the anon function in arg2 (i.e. on recieving http response object that confirms authentication success with google 0auth strategy via passport.authenticate() then redirect)
//LOGOUT
// GET /auth/logout
router.get('/logout', (request,response, next)=> {
    request.logout((error)=> {
        if (error) {return next(error)};
        response.redirect('/');
    });  // this logout method will be included into the passport middleware definition in our passport.js namespace.
});


module.exports = router;
