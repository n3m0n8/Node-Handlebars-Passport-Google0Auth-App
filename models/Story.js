const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trime: true, // trim whitespaces
    },
    body: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'public',
        enum: ['public', 'private'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, //this is like a built in graphql objectid type... basically it fetches the associated id of the mongodb being brought in and assignes here ot left side.
        ref: 'User', // this is basically a foreign key association  in SQL.. but here its just ref with mongo
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports =  mongoose.model('Story', StorySchema);