import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./db.js";
import User from "./models/userModel.js";
import generateToken from "./generateToken.js";
import protect from "./authMiddleware.js";
import Comment from "./models/commentModel.js";
import FriendRequest from "./models/friendRequestModel.js";
import Post from "./models/postModel.js";
import Story from "./models/storyModel.js";
import { Server } from "socket.io";
connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("App is running");
});

app.get("/api/users", async (req, res) => {
  const users = await User.find()
    .populate("friends", "-password")
    .select("-password");

  res.status(200).json(users);
});

app.post("/api/register", async (req, res) => {
  const { username, email, password, profilePicture } = req.body;

  if (!username || !email || !password) {
    return res.json("input all the neccessary fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json("This email is already in use");
  }

  try {
    const user = await User.create({
      username,
      email,
      password,
      profilePicture,
      selfNote: "",
      isOnline: true,
    }).then((user) => user.populate("friends", "-password"));

    if (user) {
      res.status(200).json({
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        friends: user.friends,
        createdOn: user.createdOn,
        _id: user._id,
        isOnline: user.isOnline,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json("User not created");
    }
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json("input all the neccessary fields");
  }

  try {
    const user = await User.findOne({ email, password }).populate(
      "friends",
      "-password"
    );

    if (user) {
      user.isOnline = true;
      user.save();
      res.status(200).json({
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        friends: user.friends,
        createdOn: user.createdOn,
        _id: user._id,
        isOnline: user.isOnline,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json("Could not find this account");
    }
  } catch (error) {
    console.log(error.message);
  }
});

app.put("/api/updateprofile", protect, async (req, res) => {
  const { newUsername, newProfilePicture, selfNote } = req.body;

  if (!newUsername && !newProfilePicture && !selfNote) {
    return res.json("input all neccessary fields");
  }

  //this means a user is trying to update both his/her profile picture, self note and username

  if (newUsername !== "" && newProfilePicture !== "" && selfNote !== "") {
    try {
      const updatedProfile = await User.findByIdAndUpdate(
        req.loggeduser._id,
        {
          username: newUsername,
          profilePicture: newProfilePicture,
          selfNote,
        },
        { new: true }
      ).select("-password")

      if (updatedProfile) {
        res.status(200).json(updatedProfile);
      } else {
        res.status(400).json("could not upadate this account");
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  //this mean a user is trying to update only his/her username and not picture and not selfNote

  if (newUsername !== "" && newProfilePicture === "" && selfNote === "") {
    try {
      const updatedProfile = await User.findByIdAndUpdate(
        req.loggeduser._id,
        {
          username: newUsername,
        },
        { new: true }
      ).select("-password")

      if (updatedProfile) {
        res.status(200).json(updatedProfile);
      } else {
        res.status(400).json("could not upadate this account");
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  //this mean a user is trying to update only his/her profile picture and not username and not self note

  if (newProfilePicture !== "" && newUsername === "" && selfNote === "") {
    try {
      const updatedProfile = await User.findByIdAndUpdate(
        req.loggeduser._id,
        {
          profilePicture: newProfilePicture,
        },
        { new: true }
      ).select("-password")

      if (updatedProfile) {
        res.status(200).json(updatedProfile);
      } else {
        res.status(400).json("could not upadate this account");
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  //this mean a user is trying to update only his/herself note and not username and not profile picture

  if (selfNote !== "" && newUsername === "" && newProfilePicture === "") {
    try {
      const updatedProfile = await User.findByIdAndUpdate(
        req.loggeduser._id,
        {
          selfNote,
        },
        { new: true }
      ).select("-password")

      if (updatedProfile) {
        res.status(200).json(updatedProfile);
      } else {
        res.status(400).json("could not upadate this account");
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  //this mean a user is trying to update self note and username only

  if (selfNote !== "" && newUsername !== "" && newProfilePicture === "") {
    try {
      const updatedProfile = await User.findByIdAndUpdate(
        req.loggeduser._id,
        {
          selfNote,
          username: newUsername,
        },
        { new: true }
      ).select("-password")

      if (updatedProfile) {
        res.status(200).json(updatedProfile);
      } else {
        res.status(400).json("could not upadate this account");
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  //this mean a user is trying to update self note and profile picture only

  if (selfNote !== "" && newProfilePicture !== "" && newUsername === "") {
    try {
      const updatedProfile = await User.findByIdAndUpdate(
        req.loggeduser._id,
        {
          selfNote,
          profilePicture: newProfilePicture,
        },
        { new: true }
      ).select("-password")

      if (updatedProfile) {
        res.status(200).json(updatedProfile);
      } else {
        res.status(400).json("could not upadate this account");
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  //this mean a user is trying to update profile picture and self note only

  if (newProfilePicture !== "" && newUsername !== "" && selfNote === "") {
    try {
      const updatedProfile = await User.findByIdAndUpdate(
        req.loggeduser._id,
        {
          profilePicture: newProfilePicture,
          username: newUsername,
        },
        { new: true }
      ).select("-password")

      if (updatedProfile) {
        res.status(200).json(updatedProfile);
      } else {
        res.status(400).json("could not upadate this account");
      }
    } catch (error) {
      console.log(error.message);
    }
  }
});

app.delete("/api/deleteaccount", protect, async (req, res) => {
  const deleted = await User.findByIdAndDelete(req.loggeduser._id);

  if (deleted) {
    const deletedUserPost = await Post.find({ author: deleted._id });
    if (deletedUserPost) {
      await Comment.deleteMany({ post: deletedUserPost._id });
      await Post.deleteMany({ author: deleted._id });
      await Comment.deleteMany({ author: deleted._id });
      res.json(deleted);
    }
  } else {
    res.json("could not delete account");
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "-password");

    if (posts) {
      res.status(200).json(posts.reverse());
    } else {
      res.status(400).json("could not fetch posts");
    }
  } catch (err) {
    console.log(err.messgae);
  }
});

app.post("/api/uploadpost", protect, async (req, res) => {
  const { content, image, video } = req.body;

  if (!content && !image && !video) {
    return res.json("Input all the needed fields");
  }

  try {
    const post = await Post.create({
      author: req.loggeduser._id,
      content,
      image,
      video,
    }).then((res) => {
      return res.populate("author", "-password");
    });

    if (post) {
      res.status(200).json(post);
      // console.log("hi");
      // setTimeout(() => {
      //   const deletedPost = Post.findByIdAndDelete(post._id);
      //   console.log(deletedPost);
      // }, 8000);
    } else {
      res.status(400).json("could not create this post");
    }
  } catch (err) {
    console.log(err.message);
  }
});

app.put("/api/likepost", async (req, res) => {
  const { postId } = req.body;

  try {
    const post = await Post.findById(postId);
    post.likes++;
    post.save();

    res.status(200).json(post);
  } catch (error) {
    console.log(error.message);
  }
});

app.put("/api/unlikepost", async (req, res) => {
  const { postId } = req.body;

  try {
    const post = await Post.findById(postId);
    post.likes--;
    post.save();

    res.status(200).json(post);
  } catch (error) {
    console.log(error.message);
  }
});

app.delete("/api/deletepost", protect, async (req, res) => {
  const { postId } = req.body;

  const findPost = await Post.findById(postId).populate("author", "-password");

  if (findPost.author._id.toString() !== req.loggeduser._id.toString()) {
    return res
      .status(400)
      .json("Only the person who creates a post can delete it");
  }

  const post = await Post.findByIdAndDelete(postId);

  if (post) {
    await Comment.deleteMany({ post: post._id });
    res.status(200).json(post);
  } else {
    res.status(400).json("could not delete this post");
  }
});

app.post("/api/commenttopost", protect, async (req, res) => {
  const { content, postId } = req.body;

  if (!content) {
    return res.json("Input all the necccessary fields");
  }

  try {
    const comment = await Comment.create({
      author: req.loggeduser._id,
      content,
      post: postId,
    }).then((res) =>
      res.populate("author", "-password").then((res) => res.populate("post"))
    );

    if (comment) {
      res.status(200).json(comment);
    } else {
      res.status(400).json("could not comment to this post");
    }
  } catch (err) {
    console.log(err.message);
  }
});

app.get("/api/getcomments", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.query.postId })
      .populate("author", "-password")
      .populate("post");

    if (comments) {
      res.status(200).json(comments.reverse());
    } else {
      res.status(400).json("could not fetch comments");
    }
  } catch (err) {
    console.log(err.message);
  }
});

app.put("/api/likecomment", async (req, res) => {
  const { commentId } = req.body;

  const comment = await Comment.findById(commentId);

  comment.likes++;
  comment.save();

  res.status(200).json(comment);
});

app.put("/api/unlikecomment", async (req, res) => {
  const { commentId } = req.body;

  const comment = await Comment.findById(commentId);

  comment.likes--;
  comment.save();

  res.status(200).json(comment);
});

app.post("/api/sendfriendrequest", protect, async (req, res) => {
  const { message, toId } = req.body;

  const toUser = await User.findById(toId);

  if (!message) {
    return res.json("input your introductory message");
  }

  //this will check if there is an existing friend request between the two users.
  const existingFriendRequest = await FriendRequest.findOne({
    $or: [
      {
        from: req.loggeduser._id,
        to: toId,
      },
      {
        from: toId,
        to: req.loggeduser._id,
      },
    ],
  });
  if (existingFriendRequest) {
    return res.json("You have an existing friend request");
  }

  const loggedUser = await User.findById(req.loggeduser._id).populate(
    "friends",
    "-password"
  );

  try {
    const friendRequest = await FriendRequest.create({
      from: req.loggeduser._id,
      to: toId,
      message: message,
    }).then((res) =>
      res
        .populate("from", "-password")
        .then((res) => res.populate("to", "-password"))
    );

    if (friendRequest) {
      res.status(200).json(friendRequest);
    } else {
      res.status(400).json("Could not send friend request");
    }
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/api/sentfriendrequests", protect, async (req, res) => {
  const friendRequests = await FriendRequest.find({
    from: req.loggeduser._id,
  })
    .populate("from", "-password")
    .populate("to", "-password");

  if (friendRequests) {
    res.status(200).json(friendRequests);
  } else {
    res.status(400).json("could not fetch your friend requests");
  }
});

app.get("/api/recievedfriendrequests", protect, async (req, res) => {
  const friendRequests = await FriendRequest.find({
    to: req.loggeduser._id,
  })
    .populate("from", "-password")
    .populate("to", "-password");

  if (friendRequests) {
    res.status(200).json(friendRequests);
  } else {
    res.status(400).json("could not fetch your friend requests");
  }
});

app.post("/api/acceptfriendrequest", protect, async (req, res) => {
  const { friendRequestId } = req.body;

  try {
    const friendRequest = await FriendRequest.findById(friendRequestId);

    if (friendRequest === null) {
      return res.status(400).json("This friend request does not exist");
    }

    await User.findByIdAndUpdate(
      friendRequest.from,
      {
        $push: { friends: friendRequest.to },
      },
      { new: true }
    );
    await User.findByIdAndUpdate(
      friendRequest.to,
      {
        $push: { friends: friendRequest.from },
      },
      { new: true }
    );

    const user = await User.findById(req.loggeduser._id).populate(
      "friends",
      "-password"
    );

    if (user) {
      res.status(200).json(user);
      await FriendRequest.findByIdAndDelete(friendRequest._id);
    } else {
      res.status(400).json("could not accept friend request");
    }
  } catch (error) {
    console.log(error.message);
  }
});

app.delete("/api/deletefriendrequest", async (req, res) => {
  const { friendRequestId } = req.body;
  const friendRequest = await FriendRequest.findById(friendRequestId);
  if (!friendRequest) {
    return res.status(400).json("Friend request not found");
  }
  const friendRequestToDelete = await FriendRequest.findByIdAndDelete(
    friendRequestId
  );
  if (friendRequestToDelete) {
    res.status(200).json(friendRequestToDelete);
  } else {
    res.status(400).json("Could not delete friend request");
  }
});

app.get("/api/searchusers", protect, async (req, res) => {
  const { query } = req.query;
  const users = await User.find({
    $and: [
      { username: { $regex: query, $options: "i" } },
      { _id: { $ne: req.loggeduser._id } },
    ],
  }).select("-password");

  if (users.length < 1) {
    return res.json("No users found");
  }
  res.status(200).json(users);
});

app.get("/api/getauserprofile", async (req, res) => {
  const { userId } = req.query;
  const user = await User.findById(userId)
    .populate("friends", "-password")
    .select("-password");
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(400).json("Could not get users profile");
  }
});

app.post("/api/uploadstory", protect, async (req, res) => {
  const { content, video, image } = req.body;

  if (!content && !video && !image) {
    return res.json("Please input the needed fields");
  }

  const story = await Story.create({
    content,
    image,
    video,
    author: req.loggeduser._id,
  }).then((res) => res.populate("author", "-password"));
  if (story) {
    res.status(200).json(story);
  }
});

app.get("/api/stories", protect, async (req, res) => {
  const user = await User.findById(req.loggeduser._id).populate("friends");

  const stories = await Story.find({
    author: { $in: user.friends },
  }).populate("author", "-password");

  if (stories.length < 1) {
    return res.json("No Story");
  }

  if (stories) {
    res.status(200).json(stories);
  } else {
    res.status(400).json("Could not find any stories");
  }
});

app.post("/api/logout", protect, async (req, res) => {
  const user = await User.findById(req.loggeduser._id).select("-password");
  if (user) {
    user.isOnline = false;
    user.save();
    res.json(user);
  }
});

const server = app.listen(3005, () => {
  console.log("app is running");
});

// const socket = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   },
// });

// socket.on("connection", (socket) => {
//   console.log(`${socket.id} connected`);
//   socket.on("uploadpost", (postData) => {
//     socket.emit("getpost", postData);
//   });
// });
