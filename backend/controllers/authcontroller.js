import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import user from "../models/usermodel.js";
import bcrypt from "bcryptjs"

export const signup = async (req,res)=>{
    try{
        const{fullname,username,email,password}=req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}
        //const emailRegex = 

        const existinguser = await user.findOne({ username})
        if(existinguser){
            return res.status(400).json({ error: "username is already taken"})
        }

        const existingemail = await user.findOne({ email})
        if(existingemail){
            return res.status(400).json({ error: "email is already taken"})
        }
        if (password.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters long" });
		}



//hash password

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new user({        //create user
            fullname,
            username,
            email,
            password: hashedPassword
        })

        if(newUser){
            generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();    //saveuser to database

			res.status(201).json({
				_id: newUser._id,
				fullname: newUser.fullname,
				username: newUser.username,
				email: newUser.email,
				followers: newUser.followers,
				following: newUser.following,
				profileImg: newUser.profileImg,
				coverImg: newUser.coverImg
        })
    }else{
        res.status(400).json({ error: "Invalid user data" });
     }

    } catch (error){
        console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
    }
    }

    export const login = async (req, res) => {
        try {
            const { username, password } = req.body;
            const User = await user.findOne({ username });
            const isPasswordCorrect = await bcrypt.compare(password, User?.password || "");
    
            if (!User || !isPasswordCorrect) {
                return res.status(400).json({ error: "Invalid username or password" });
            }
    
            generateTokenAndSetCookie(User._id, res);
    
            res.status(200).json({
                _id: User._id,
                fullname: User.fullname,
                username: User.username,
                email: User.email,
                followers: User.followers,
                following: User.following,
                profileImg: User.profileImg,
                coverImg: User.coverImg,
            });
        } catch (error) {
            console.log("Error in login controller", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };




export const logout = async (req,res)=>{
    try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}


}

export const getMe = async (req, res) => {
	try {
		const User = await user.findById(req.user._id).select("-password");
		res.status(200).json(User);
	} catch (error) {
		console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};


