import express from "express";
import dotenv from "dotenv"
import authRoutes from "./routes/authroutes.js"
import userRoutes from "./routes/userroutes.js"
import mongoose from "mongoose";
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary} from "cloudinary"
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})
const app= express()
const PORT = process.env.PORT || 5000;

app.use(express.json())
app.use(express.urlencoded({extended: true }))    //to parse url data with(urlencoded) 
app.use(cookieParser())
// console.log(process.env.MONGO_URI)

app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);




// app.get("/",(req,res)=>{
//     res.send("server is ready")
// })

app.listen (PORT, () =>{
    console.log('server is running on port '+ PORT);
    connectMongoDB()
})
