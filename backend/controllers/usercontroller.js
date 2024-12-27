
import bcrypt from "bcryptjs"
import { v2 as cloudinary} from "cloudinary"
import user from "../models/usermodel.js"
import Notification from "../models/notificationmodel.js";
import { json } from "express";


export const getUserProfile = async (req, res) => {
	const { username } = req.params;

	try {
		const User = await user.findOne({ username }).select("-password");
		if (!User) return res.status(404).json({ error: error.message});

		res.status(200).json(User);
	} catch (error) {
		console.log("Error in getUserProfile: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const followUnfollowUser = async (req, res) => {
	try {
		const { id } = req.params;
		const userToModify = await user.findById(id);
		const currentUser = await user.findById(req.user._id);

		if (id === req.user._id.toString()) {
			return res.status(400).json({ error: "You can't follow/unfollow yourself" });
		}

		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

		const isFollowing = currentUser.following.includes(id);

		if (isFollowing) {
			// Unfollow the user
			await user.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });   //pull to unfollow
			await user.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

			res.status(200).json({ message: "User unfollowed successfully" });
		} else {
			// Follow the user
			await user.findByIdAndUpdate(id, { $push: { followers: req.user._id } });   //push to follow
			await user.findByIdAndUpdate(req.user._id, { $push: { following: id } });
			//Send notification to the user
			const newNotification = new Notification({
				type: "follow",
				from: req.user._id,
				to: userToModify._id,
			});

			await newNotification.save();
            //to return the id of the user as a response
			res.status(200).json({ message: "User followed successfully" });
		}
	} catch (error) {
		console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const getSuggestedUsers = async(req,res)=>{
	try {
		const userID = req.user._id;

		const userFollowedByMe = await user.findById(userID).select("following")
		const users = await user.aggregate([
			{
				$match:{
					_id: {$ne:userID}
				}
			},
			{$sample:{size:10}}
		])

		const filteredUsers= users.filter(user=>!userFollowedByMe.following.includes(user._id))
        const  suggestedUsers = filteredUsers.slice(0,4)
       suggestedUsers.forEach(user=>user.password=null)

	   res.status(500).json(suggestedUsers)
	

		
	} catch (error) {
		console.log("error in getsuggestedusers:",error.message)
		res.status(500),json({error:error.message})

		
	}
}

export const updateUser= async(req,res)=>{
	const {fullname,email,username,currentPassword,newPassword,bio,link} = req.body;
	let{profileImg,coverImg} = req.body;
    
	const userID = req.user._id;
	try {
		let User = await user.findById(userID)
		if(!User) return res.status(404).json({ message: "user not found"});
		 if ((!newPassword && currentPassword) || (!currentPassword && newPassword)){
			return res.status(400).json({ error: "please provide both current passwprd and new password"})
		 }
		 if (currentPassword && newPassword){
			const isMatch = await bcrypt.compare(currentPassword,User.password)
			if(!isMatch) return res.status(400).json({error: "current password is incorrect"})
			if(newPassword.length<6){
				return res.status(400).json({ error: "password must be atleast 6 digit"})

			}
			const salt = await bcrypt.genSalt(10);
			User.password = await bcrypt.hash(newPassword,salt);

		 }
		 if(profileImg){
			if(User.profileImg){
				await cloudinary.uploader.destroy(User.profileImg.split("/").pop().split(".")[0])

			}
			const uploadResponse= await cloudinary.uploader.upload(profileImg)
			profileImg =uploadResponse.secure_url;

		 }
		 if(coverImg){
			if(User.coverImg){
				await cloudinary.uploader.destroy(User.coverImg.split("/").pop().split(".")[0])

			}
			const uploadResponse= await cloudinary.uploader.upload(coverImg)
			coverImg =uploadResponse.secure_url;
		 }
		 User.fullname = fullname || User.fullname;
		User.email = email || User.email;
		User.username = username || User.username;
		User.bio = bio || User.bio;
		User.link = link || User.link;
		User.profileImg = profileImg || User.profileImg;
		User.coverImg = coverImg || User.coverImg;

        User = await User.save();

		// password should be null in response
		User.password = null;

		return res.status(200).json(User);

	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}

}