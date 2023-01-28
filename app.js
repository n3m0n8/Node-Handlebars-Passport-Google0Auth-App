//////IMPORTS/REQUIRES\\\\\\
const path = require('path'); // path is core node module allowing static path setting
const express = require('express'); //express router
const { default: mongoose } = require('mongoose');
const dotenv  = require('dotenv'); //environment package management for node
const morgan  = require('morgan'); //morgan is a package allowing realtime update of HTTP requests with headers and path (kind of nodemon and postman together)
const exphbs  = require('express-handlebars'); // handlebars is a multi-language package allowing generating frontend views from the backend with html injection
// import passport which is a handler for Open Authorization 0Auth... 0Auth broadly works via three handshakes:
//a)first the third-party resource(i.e. us the domain/server) makes a request to the uder-agent accessing that third party to do so via a linked authentication resources like Google or other id/email/app service
//then the user-agent grants auth by writing in their credentials for that authorising auth resource like google  - that's the first handshake (on the front end)
//b) the second handshake is the on the backend between the the third-party and the authorising auth service/app (i.e. google for instance)'s own backend api. THis second handshake would deal with general verification of the user-agents supplied credentials against the auth services' databse records
//c) finally and optionally, a third handshake is undertaken between third-party and auth service if the purpose of the authentication is for a specific resource/api ... for example with google, there is compartmentalisation of the user's services (like, youtube, google+ for their personal id, photos, drive etc)... so a third handshake confirms a request with the verified/auth'd credentials for the specific resource being delegated to the auth service by the third party on behalf of the user-agent
//method override package
const methodOverride = require('method-override');
const passport = require('passport');

// import the express-session package for express.. this package sets and manages a user session cookie for an http session cookie to be saved to the server while generating a session id on the browser .
const session = require('express-session');
const connectDB = require('./config/db'); //custom defined database.js namespace which configures our mongo DB atlas api.
//note this consturct is deprecated... 
//const MongoStore = require('connect-mongo')(session);
//new mongoose connect construct doesn't explicitly IIFE the (session) method annexed... and also in the session parameter block itself, the parameter relating to mongoos doesn't use new keyword but rather concatanates a .create()
const MongoStore = require('connect-mongo');
///CONFIG/SETUP\\\
// load up the config file from the config directory withing main directory.
dotenv.config({ path: './config/config.env' });

// instantiate an instance of the express router encapsulated as app const
const app = express();
//initialise request body parser middleware class for express to be deployed in uploading stories via POST - note also accept JSON  as well as urlencoded(even though we are only using urlencoded)
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//method override middleware implemntation

app.use(methodOverride
    (function(request, response){
        if (request.body && typeof request.body === 'object' && '_method' in request.body){
            // look in urlencoded POST body and delete it
            var method = request.body._method;
            delete request.body._method;
            return method;
        };
    }),
);

// Passport
require('./config/passport')(passport); // another crazy js quirk... immediately invoked function as is the case here with the (passport) package being invoked in conjunction with our custom passport.js config file need to have a ; to let parser know there is a separation of functions.... otherwise nodemon crashes. // now it works... not clear why it was the case... it works with or without ; ... this is why PHP is superior- typecript type-enforcement can help standardise assignments but when it comes to clean, fluid, clearn and uncluttered code PHP is much better.
//separately requiring passport doesn't work, because it has alreayd beeen required/importent globally in the namespace at the top of the sourcecode.... typicall NODE/JS quirkiness and overall patchiness that makes it much less pleasant to work with than Laravel or Symphony (albeit an argument can be made that it is lighter since we build our backend package from the ground up in a sense unlike the prepackaged php frameworks, and perhaps one can argue it provides more grounds for creativity/customisation -- albeit at a significant cost to elegance)
// the IIFE(Immediately Invoked Function Expression) is like a reverse of an async...await expression. whereas async is used to delay the runtime execution of a parsed piece of JS code until the awaited data/action arrives... here we tell engine to do the opposite: upon parsing/reading through our code, we want browser/host to immediately execute to the parsed function that has been previously defined in the source code... before any of the other source code is runtim'd, e.g global or other function blocks (and obviously the async'd block)
// in this case we are first deploying custom namespace /config/passport.js which is actually ONLY an export function that ITSELF imports the passport package namespace which is held in the passport package library as arg1 of that function. Then, in the fucntion block ,the implementation of that passport namespace's use method is passed a custom GoogleStrategy  method with the various custom inputs for its destructured arg1 object container. in otherwords.. the custome instance of the GoogleStrategy defined iun arg1 of the passport.use(arg1) prebuilt method that was important and exported in our custom /config/passport.js class is now beind parsed by the javascript/browser engine at this point of the code BUT immediately after this, the (passport) - which is self-referencing to the passport packge's passport namespace IIFE function gets triggered. Why? because we want the parser to immediately understand first what the passport namespace is spelling out (it's conditions, methods etc...) BEFORE the runtime exec of the rest of our sourcecode including this custom config/passport.js class being required into app.js...later on in this app.js namespace, we will passport.initialise() this now modified versio nof the inbuilt pasport namespace with our modifed GoolgeStrategy values (including our google id and secret key to allow transaction2 of our 0Auth exchange - i.e. after the user-agent has sent us their credentials from their front-end to our backend, we can now show google's Google+ api our own credentials using this Passport GoogleStrategy while also sending our user's credentials for their own Google+ account i..e their profile, which we recieve and then Mongoose schema map out onto our MongoDB and send back to the front end for them to see their login was successful )
//DB
connectDB();

/////METADATA/LOGGING\\\\\
//if in dev run, use morgan -- basically like postman but console-based... it allows execution of http requests outside of a browser environemnt.
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

/////MIDDLEWARE\\\\\
//session middlware generating a session id & storage cookie for every http/s request by a user-agent... the session id (presumably a random generated hash) aspect is stored on the user-agents browser memory while the storage element with data about the cookie is held (i guess in main/volatile memory) on the server.. the following is the data passed as destructured options to the arg1 of the express-session() class main meth.  
app.use(session({
    // note 
    //genid: function(req){return genuuid()} //this is already done by default without the need to add this option in the destructured arg1... we would only use it to customise the unique user id (uuid) of the session cookie being sent to our user-agent... the default genuuid()meth uses an optional uid-safe library to ensure that the hash is securley generated
    secret: process.env.EXPRESS_SESSION_COOKIE_SECRET_KEY, //custom secret string for session cookie - recommended to protect against  blind session hijacking attacks wherein the generated hashed id of the sessiion cookie being communicated between the server to the user is correctly guessed, allowing the attacker access to the user's inputted credentials and thus hijacking the session for malintent 
    //note the complex string of chars and ints to decrease chances of blind hijack via guessing/ automated guess... that is best practices for opSec
    //store session in environemnt for leak protection when gittin' is best opsec 
    resave: false, //resave for saving a session if nothing has been modified in state... false means don't resave when nothing has been modified 
    saveUninitialized: false, // false means don't create a session if nothing is being stored in state.... only if something is init'd
    //cookie: {secure: true},  //https cookier flag - not used in localhost since we are using http but recopmmnended for production given prevalance of https and recommended to protect agaisnt XSS attakcs
    // further options available as per documentation:
    // domain: '' can specify a domain. by default the requesting domain is passed but one can override this and grant session to another domain (for example with an in window embedded app perhaps)
    // path: '/path' - an intersting one like domain: but this time specifying a particular path/route of the app/website.... again useful for appSec default is / home
    //sameSite: // similar to the above in the sense that it blocks any session being granted by a scirpt or aciton is originating in the same domain as the current/requesting site -- true will set this option to strict mode, lax will relax rules, false will remove the same site check while strict will set it to strict also.
    //expires: ''  set the expiry of the session cookie... the default for most browsers as per mozilla is upon window closing or after a set time... but some browsers have a session reactivation feature to stop a session expiry on closing window event... so this could be useful for more secure-focussed apps - overriding the default by specifying a time.
    //maxAge: similar to above but less direct... basically sets a max timeout... if both of these are set, then whichever is soonest will prevail
    //here we add the mongoStore encapsulated var that holds the connect-mongo middleware package... this will inject our session cookie with a local storage of the relevant MongoDB-held/absorbed details for the user that has currently auth'd a session ... the point here is to avoid auto-signing out the user on browser window refresh... because the session will now have stored here a copy of the users' auth details
    store: MongoStore.create( {mongoUrl: mongoose.connection.client.s.url}),
}));
//handlebars helpers:
const { formatDate, truncate, stripTags, editIcon  } = require('./helpers/hbs');

//Handlebars
//handlebars generates front end views... a version of blades in laravel
//..  the engine() method belongs to express. within it arg1 sets the engin file extensions to .hbs... arg2 takes a furhter method which is the actually chosen template views generating engine ... in this case the express-handlebars engine (which we have imported as exphbs).
// note that all are views should, normally, be wrapped by a default template view which will generate the basic defaults of the page like layouts ect (in laravel or react we can have a similar layout view/component that wraps around differeing resource-linked views)... to wrap a default layout we add it to the arg1 destructured options  object arry in the expbhs() meth -- in his tutorial he's called this the main file which we create in the ./views directory
app.engine('.hbs', exphbs.engine({ 
        helpers: { formatDate, stripTags, truncate, editIcon, } ,
        defaultLayout: 'mainLayout', 
        extname: '.hbs',
    })
);
//having defioned the viuews generatng engine, we set it to the express served app.
app.set('view engine', '.hbs');
//passport 

// the init meth initialises the passport instance for a session. it is only required for when using passport with some kind of session-related strategy as is the case with Google auth 2.0.
app.use(passport.initialize());
/// this is essentially an invokation of the passport.session middleware - middleware being some kind of callback function dealing with the http request object that is being handled. the longform versiion is:
//app.use(passport.authenticate('session'));
//where passport package library is guided to authenticate namespaces/function and that has a session passed to it... 
//the below version is the shorthand, comin from passport package library's session.js namespace and deploying the session() method instances a new SessionStrategy object instance. The document on SessionStrategy by passport creator Jared Hanson that "this strategy merely restores the authentication state from the session, it does not  authenticate the session itself.  Authenticating the underlying session is assumed to have been done by the middleware implementing session support."
// in otherwords the purpose of passport.session() is not to create a session cookie... but rather to retrieve/refresh one - in the current environment, that is handled by the express-session package, as done in jsut above when we initialised the express-session package instance that contained a function block with the session cookie data (session cookie uuid was just left for generation)
app.use(passport.session());
//NOTE ,now that we associated the express-session instantiated session cookied to the passport packages' authentication methd 'session' method we can have the passport.js namespace in our project held under the config files to specify the details of that passport-middlewared/handled express-session instanced session cookie response to an http request object incoming to our server.

//set a global express variable in order to pass the user id from mongoose to the handlebars template engine ?not sure how this is working... it seems to do same as setting a static directory...
app.use(function(request, response, next){
    response.locals.user = request.user || null,
    next();
})

//////STATIC RESOURCES DIRECTORY\\\\\
app.use(express.static(path.join(__dirname, 'public'))); // basically we deploy the node path package and use the vanilla js join(meth) to join the currently operating directory (i.e. /NodeBackendProject) and concatanate to that the /public sub-directory .... we are basically pointing out where this static public resources directory is to be found by the express router. /mainDirect/public..
////ROUTES\\\
//ROutes defined here with a pointer to the index.js routing outline namespace being fed as arg2 of the express's use() method , arg1 being the base path /
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));

//stories routes:
app.use('/stories', require('./routes/stories'));
////RUNTIME EXEC\\\\
//drag in the relevant configuartion envrionement json data for connecting to relevant port OR | default to port 5000:
const PORT = process.env.PORT || 5000;
// call the newly encapsulted app const which is an instance of the express router to listen for request to connect
app.listen(PORT, /*DONT FORGET THE CALLBACK FUNCTION OTHERWISE THE SERVER IS LOOOKING TO RUN A STRING!!*/ console.log( `Server up on ${PORT} as a ${process.env.NODE_ENV} environment`)
);


