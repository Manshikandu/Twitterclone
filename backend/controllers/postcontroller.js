import Notification from "../models/notificationmodel.js"
import Post from "../models/postmodel.js";
import user from "../models/usermodel.js";
import {v2 as cloudinary} from "cloudinary";

export const createPost = async(req,res) => {
    try {
        const {text}= req.body;
        let { img }= req.body
        const userId = req.user._id.toString();
        const User= await user.findById(userId)
        if(!User) return res.status(404).json({message: "user not found"})
         
        if(!text && !img){
             return res.status(400).json({error: "Post must have an image"})
        }
        if(img){
            const uploadResponse= await cloudinary.uploader.upload(img)
            img = uploadResponse.secure_url
        }

        const newPost = new Post({
            User:userId,
            text,
            img
        })

        await newPost.save();
        res.status(201).json(newPost);

    } catch (error) {
        res.status(500).json({error: "Internal server error"})
        console.log(err);
    }
}

export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		if (post.User.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "You are not authorized to delete this post" });
		}

		if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

		await Post.findByIdAndDelete(req.params.id);   //mongo db bata delete gareko

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		console.log("Error in deletePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// export const commentOnPost = async (req, res) => {
// 	try {
// 		const { text } = req.body;
// 		const postId = req.params.id;
// 		const userId = req.user._id;

// 		if (!text) {
// 			return res.status(400).json({ error: "Text field is required" });
// 		}
// 		const post = await Post.findById(postId);

// 		if (!post) {
// 			return res.status(404).json({ error: "Post not found" });
// 		}

// 		const comments = { user: userId, text };

// 		post.comment.push(comments);
// 		await post.save();

// 		res.status(200).json(post);
// 	} catch (error) {
// 		console.log("Error in commentOnPost controller: ", error);
// 		res.status(500).json({ error: "Internal server error" });
// 	}
// };

export const likeUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            res.status(200).json({message: "post unlike succesfuly"})
			await user.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await user.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.User,
				type: "like",
			});
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getAllPosts = async (req, res) => {
	try {
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate({
				path: "User",
				select: "-password",
			})
			.populate({
				path: "comment.User",
				select: "-password",
			});

		if (posts.length === 0) {
			return res.status(200).json([]);
		}

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getAllPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getLikedPosts = async (req, res) => {
	const userId = req.params.id;

	try {
		const User = await user.findById(userId);
		if (!User) return res.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: User.likedPosts } })
			.populate({
				path: "User",
				select: "-password",
			})
			.populate({
				path: "comment.User",
				select: "-password",
			});

		res.status(200).json(likedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getFollowingPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const User = await user.findById(userId);
		if (!User) return res.status(404).json({ error: "User not found" });

		const following = User.following;

		const feedPosts = await Post.find({ User: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "User",
				select: "-password",
			})
			.populate({
				path: "comment.User",
				select: "-password",
			});

		res.status(200).json(feedPosts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params;

		const User = await user.findOne({ username });
		if (!User) return res.status(404).json({ error: "User not found" });

		const posts = await Post.find({ User: User._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "User",
				select: "-password",
			})
			.populate({
				path: "comment.User",
				select: "-password",
			});

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};