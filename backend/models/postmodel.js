import mongoose from "mongoose"

const postSchema = new mongoose.Schema({
    User:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    text:{
        type: String,
    },
    img:{
        type: String,

    },
    likes:[

    
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },

    ],
    comment:[
        {
            text:{
                type: String,
                required: true,
            },
            User:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
                required: true,

            },
        },
    ],

    },{timestamps: true}

)
const Post = mongoose.model("Post",postSchema)
export default Post;