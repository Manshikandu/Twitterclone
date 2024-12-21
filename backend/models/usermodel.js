import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    //member since july 2021 createdAt
username:{
    type: String,
    required: true,
    unique: true
},
fullname:{
    type: String,
    required: true,
},
password:{
    type: String,
    required: true,
    minlength: 6
},
email:{
    type: String,
    required: true,
    unique: true,

},
followers:[
    {
    type: mongoose.Schema.Types.ObjectId,  
     //16 characters 
     ref:"user",
     default: []


    }
],
following:[
    {
    type: mongoose.Schema.Types.ObjectId,  
     //16 characters 
     ref:"user",
     default: []


    }
],
profileImg:{
    type: String,
    default: "",
},
coverImg:{
    type: String,
    default: "",
},
bio:{
    type: String,
    default: "",
},
link:{
    type: String,
    default: "",
},





},{timestamps: true})

const user = mongoose.model("user",userSchema)
export default user;