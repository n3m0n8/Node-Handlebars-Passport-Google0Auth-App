const express = require('express');
const { authFlow  } = require('../middleware/authCheck');

const router = express.Router();

const Story = require('../models/Story');

// show add stories page
//GET stories/add
router.get('/add', authFlow, (request, response)=>{
        response.render('stories/add');
    }
);
// process add storyu
//POST /stories
router.post('/', authFlow, async (request, response)=>{
    try{
        request.body.user = request.user.id;
        await Story.create(request.body);
        response.redirect('/dashboard');
    }
    catch(err){
        console.error(err);
        response.render('error/500');
    }
}
);

// show all public stories
//GET stories
router.get('/', authFlow, async (request, response)=>{
    try{ 
        const stories = await Story.find({ status: 'public' }).populate('user').sort({
                                createdAt: 'desc',
                            }).lean();
        response.render('stories/index',{
            stories,
        });
    }
    catch(error){
        console.error(error);
        response.render('error/500');
    }
}
);


// show one story
//GET /stories/:id
router.get('/:id', authFlow, async (request,response)=>{
    try{
        let story = await Story.findById(request.params.id).populate('user').lean();

        if(!story){
            return response.render('error/404');
        };
        response.render('stories/show', {
            story,
        });
    }catch(error){
        console.error(error);
        return response.render('error/404');
    };
},  
);

// show user-affiliated stories view:
//GET /stories/user/:userId
router.get('/user/:userId', authFlow, async (request, response)=>{
        try{
            const stories = await Story.find({ 
                user: request.params.userId,
                status: 'public',                
            }).populate('user').lean();
            response.render('stories/index', {
                stories,
            });
        }catch(error){
            console.error(error);
            request.redirect('error/500');
        }
    }
);


// SHOW EDIT STORY PAGE 
// GET  stories/edit/:id
router.get('/edit/:id', authFlow, async (request, response)=>{
    const story = await Story.findOne(
        {
            _id: request.params.id,
        }).lean();
    if(!story){
        return response.render('error/404');
    }

    if(story.user != request.user.id){
        response.redirect('/stories');
    } else{
        response.render('stories/edit', { story, }
        );
    }
}
);

// update stories ROute
// PUT /stories/:id

router.put('/:id', authFlow, async(request, response)=>{
        try{
            let story = await Story.findById(request.params.id).lean();

            if(!story){
                return response.render('error/404');
            }
            if(story.user != request.user.id){
                response.redirect('/stories');
            } else{
                story = await Story.findByIdAndUpdate({ _id: request.params.id }, request.body, {
                        new: true,
                        runValidators: true,
                    }, 
                );
                response.redirect('/dashboard');
            };
        }catch(error){
            console.error(error);
            return response.render('error/500');
        }
    },
);

// DELETE router
// DELETE /stories/:id
router.delete('/:id', authFlow, async (request, response)=>{
        try{
            // -- initial construct but this would still allow other users to delete the stories from another user:  await Story.remove({ id: request.params.id });
            let story =  await Story.findById(request.params.id).lean();
                if(!story){
                    return response.render('error/404');
                }if(story.user != request.user.id){
                    response.render('error/403');
                }else{
                    await Story.remove({_id: request.params.id});
                    response.redirect('/dashboard');
                }
        }catch(error){
            console.error(error);
            return response.render('error/500');
        };
    },   
);

module.exports = router;