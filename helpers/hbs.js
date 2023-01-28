const moment = require('moment');

module.exports = {
    formatDate: function (date, format){
        return moment(date).format(format);
    },
    truncate: function(storyBlock, maxLength){
        if (storyBlock.length > maxLength && storyBlock.length > 0){
            let truncStoryBlock = storyBlock + ' ';
            truncStoryBlock = storyBlock.substr(0, maxLength);
            truncStoryBlock = storyBlock.substr(0, truncStoryBlock.lastIndexOf(' ')); 
            truncStoryBlock = truncStoryBlock > 0 ? truncStoryBlock : storyBlock.substr(0, maxLength);
            return truncStoryBlock + '...'
        }
        return storyBlock;
    },
    stripTags: function(input){
        return input.replace(/<(?:.|\n|>)*?>/gm, '');
    },
    editIcon: function(storyUser, loggedUser, storyId, floating = true){
        if (storyUser._id.toString() == loggedUser._id.toString()){
            if(floating){
                return `<a href="/stories/edit/${storyId}" class="btn-floating halfway-fab blue"><i class="bi bi-text-indent-left"></i></a>`;
            }else{
                return `<a href="/stories/edit/${storyId}"><i class="bi bi-text-indent-left"></i></a>`;
            }
        }else{
            return '';
        }


    }
};