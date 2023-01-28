// having instanced an express-session with the passport library's authentication method and sessionStrategy method/namespace(session.js in the passport package) we now defined the parameters of its deployment within our custom passport.js configuration.
// so now we specify to passport that we want to be using the GoogleStrategy const as an alias/ encapsulation of the passport-google-auth20 namespace/templateclass:: (.in JS)Strategy() model method
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// we will need mongoose because we will be taking anyone using their Google id to grab some of their Google id objects like their id name and photo to store them on our database (i.e. it's like an alias for a traditional user registration)
const mongoose = require('mongoose');

//import as placeholder const User our mongoose MongoDB schema template class of /models/User for alignment of these recieved Google 0auth values (i.e. name, profile picture etc) onto or MongoDb Atlas object instance based on our mongoose (ORM) schema
const User = require('../models/User');

// now we follow the passport-google-0auth2 method's template but deploy it as an instance (on the basis of its constructor i.e. new GoogleStrategy) and export this as the passport function.
module.exports = function(passport){
    passport.use(new GoogleStrategy(
    //THIS FIRST DESTRUCTURED OBJECT PARAMETER DEALS WITH THE SECOND OF THE HANDSHAKES DATA- BUT HERE IT CONCENRNS OUR BACKEND-HELD CREDENTIALS AND GOOGLE'S (+) API
        {
            //as explained on app.js this is all a 'local scope/instantiation' overriding of the prebuilt GoogleStrategy meth, held within the passport package passport namespace
            // we override the defaults with our custom google api credentials
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            //and the address to which we want the callback - i.e. the returning frisbee following successful user-agent and our own api authentication in the 2 separate handshakes (us toward user-agent-back to us and us with our credentials and user agent creds to google and google back to us)
            callbackURL: '/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done)=>{
            //this is a temporary consol'd out override, to check we are getting the user-agent's creds logg'd out to use for checking before doing anything with it on the frontend
            //console.log(profile);
            // note the 4 args include access token, refresh and done... not used as yet. Now we can deploy these args so as to map whatever json data is incoming from google api onto our User mongoose schema class. 
            //note that these left hand side values are the mongoos User schma model class while the right hand are the json locations of google account data values.
            //here we set up a destructured object array that holds the mappings of the newUser from Google api values to be inputted to our MongoDB
            const newUser = {
                googleId: profile.id,
                displayName: profile.displayName,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                image: profile.photos[0].value,
            };
            // now we have a try-catch block to input our values
            try {
                 // let the user placeholder be an instance of our User model class found if existing on our MongoDB users collection/table 
                let user = await User.findOne({googleId: profile.id});
                //if that user exits, then we are done... exit with null action and fetch me that user(arg2) of done()
                    if(user){
                        done(null, user)
                    }
                    //other wise input the user once data has been caught from google api. exit with null further action and this newly minted user instance of the User mongoose template class/schema
                    else{
                        user = await User.create(newUser);
                        done(null, user);
                    }
                    //any bug, lemmino
            } catch (error) {
                console.error(error);
            }

        })
    );
    // HERE WE ARE NOT DEALING WITH GOOGLE ANYMORE- WE HAVE RECIEVED THE RELEVANT USER-AGENTS GOOGLE ID AND THEY'VE BEEN AUTH'd AS HAVE HAD OUR API CREDS AUTH'd. INSTEAD, WE ARE USING PASSPORT PACKAGE NAMESPACE TO FILL OUR EXPRESS-SESSION SESSION COOKIE WITH THE DATA REQUIRED TO ASSOCIATE THE UUID SESSION COOKIE THAT WAS GENERATED WITH THIS GOOGLE ID THAT WE HAVE NOT TRANSLATED OVER TO MONGO VIA MONGOOSE user.js TEMPLATE SCHEMA CLASS. 
    //serialize/de- is simple enough... it's analogous to a write to and read from a Buffer in Java or python (expect in that case it's low-level i.e. bytecode being read to buffer and usually with some conversion like toString()... here it's just reading data to and from the session cookie - maybe a better analogy is zip and unzip) 
    passport.serializeUser((user, done)=>{
        // so we serializeUser- which is a prebuilt method from the passport namespace. what this does is send over to the express-session session cookie the MongoDB id property (which is actually translated as googleId in our mongoose User template model of that template's individual instance (i.e. user).
        // the done() method says, whatever is spelt out in args and then that's it... the purpose here is to ensure that the session cookie being filled with the data only recieves the id - because that's all that is need for our purposes of assocaited that uuid'd session cookie sitting on user-agent's browser with user-agents googleId, fetched via 0auth and now stored as id prop of user instance on MongoDB
        //this is for the INITIAL SAVING/MAPPING of our signed in user's unique google id onto their browser's express-session generated session cookie's uuid
            done(null, user.id);
        });
    passport.deserializeUser((id, done)=>{
        // here we do the reverse... ie we READ rather than WRITE (which we did above)... we findById via the User mongoose template - searching our MongoDB data objects for a hit on the relevant id property (which is aliased as googleId since we are using GoogleStrategy) 
        // this is instead for returning/retaining visits / refreshing. I.e. to maintian that association and allow the sessioncookie to keep re-associating it's uuid property with that found via mongoose on the mongoDB googleid/id prop of relevant mongoDB data object
        User.findById(id, (err, user)=>done(err, user));
    });
};