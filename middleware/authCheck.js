// a middleware (rememebr that middleware is a kind of 'stack' of custom written/imported third party functions/namespaces that 'intercept' the http request/response handshake on a particular route/path with a particualr method (POST, GET PUT, PATCH etc) In this case, we run an authentication check to make sure that an attacker or accidental person doesnt access a path/route that they should not have access to by simply writing the path uri in their browser bar.... in other words, this check 'veils' certain paths to be open only for those who have properly been auth'd in this case vi our auth.js google 0auth strategy.  Again, this process here is more barebones perhaps than the pre-packaged laravel/symfony ones and thus might be useful for handling large network volumes/ for speed, but definitely much more laborious, inquisitive and painfully self-excorciating.... if the php packages try to be composers like Beethoven in their name, maybe a MERN package could take their name after Stravinsky.)
module.exports = {
    //export two props that recieve the rquest, response and next objects of the http handshake lifecycles.
    authFlow: function(request, response, next){
        // check the http request object against the inbuilt isAuth'd method of the /passport/passport namespace
        if (request.isAuthenticated()){
            return next(); // if we are good, then hit up next http object for the auth'd user, in other words, watever they are going to like for example the /dashboard or an individual story
        }else {
            // if not, redirect back to home... unauthorised
            response.redirect('/');
        };
    },
    unauthFlow: function(request, response, next){
        //this is doing the exact reverse of the auth'd flow above... i.e. in this case, if you are auth'd then we don't want any movement out of the natural auth'd splashpage which is /dashboard... so the first redirect forces an auth'd user back to /dashboard if they try to go to / for example...
        if (request.isAuthenticated()){
            response.redirect('/dashboard');
        } // and in reverse to the previous function, here, the unauth'd has their own flow moving, i.e. the next() object will bring them to the next() unauth'd response which is just / since the other paths are veild
        else {
            return next();
        }
    },
};