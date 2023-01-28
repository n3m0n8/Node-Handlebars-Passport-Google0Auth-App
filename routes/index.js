// we will use / as the basis of our static routes i.e. /stories /whatever... so / is index which outlines the various routes to be served by the expresS router.
//import express as express const

const express = require ('express');
//iumport the authentication check middleware to deploy as arg2s in our routes (as a check while htttp request/repsone objects are moving.)
const { authFlow, unauthFlow } = require('../middleware/authCheck');
///instantiate a router from expressss via express' router () meth
const router = express.Router();

//bring in mongoose Story model so that we can bring in stories relevant to a particular user on our Dashboard route
const Story = require('../models/Story');


///////ROUTES\\\\\
// LOGIN & LANDING PAGE SIMULTANEOUSROUTE
//GET 
//deploy express router's get() method with arg1 taking the path and arg2 with a callback function determining action to be taken upon user hitting that path
router.get('/', unauthFlow, (request, response,)=>{
    //send must be anoth of express router's inbuilt funcs that sends a particular resource on the basis of a user hitting a path 
    // here the resource is named as login --  to be attached to our login.hbs view generated and injected into our main.hbs {{body}} tag 
    // response.send('login');
    //instead of the above send() method which simply redirects to specified resrouce, we now use render() which will instead inject the arg1 passed namespace(in this case the dashboard.handlebars view) into our {{body}} tag on main layout.
    response.render('login', /*options*/ {
        'layout': 'loginLayout',
    });
    //note that arg2 is destructured object that holds options key-value pairs... in this case our injected handlebars lauyout for the view that is being served up on / by router.get()
});
// USER  DASHBOARD ROUTE
//GET 
router.get('/dashboard', authFlow, async (request, response)=>{
    try {
        const stories = await Story.find({ user: request.user.id }).lean();
        //response.send('dashboard');
        response.render('dashboard', {
        'name': request.user?.firstName,
        stories,
    });
    }catch(error){
        console.error(error);
        response.render('error/500');
    }
    
});


// SHOW EDIT PAGE
// GET /logout


// ALL STORIES ROUTE
//GET

// SINGLE STORY ROUTE
//GET

// ADD STORY ROUTE
//POST

// EDIT STORY ROUTE
//PATCH



//export this router from current namespace:
module.exports = router;
