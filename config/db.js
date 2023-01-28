// instantiate a new instance of the mongoose object
const mongoose = require('mongoose');

// connectDB container var which holds the connectioon to database protocol. it is an async function awaiting a connection request via the try blcok. there is as catch block for execptions
const connectDB = async ()=> {
    try{
        // this is the connection attemtpt itslf, basicually using mongoose's prebuilt connect method... we pass arg1 the confined env CONSTANT of the mongo atlas db URI and arg2 is a destructured options object list
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // these are options for the mongoose.connect arg2... 
            // these basically remove warnings from the browser console relating to connection types.
            useNewUrlParser: true,
            useUnifiedTopology: true,
            //useFindAndModify: false,
            //serverApi: 'ServerApiVersion.6.0', 
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }
    catch(error){
        console.error('Error caught:' + error);
        // dont forget to exit with error code 1 for error.
        process.exit(1);
    }
}
//also you need to export this namespace for it to be used by app.js
module.exports = connectDB;