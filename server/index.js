import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import UserModel from "./models/UserModel.js";
import PostModel from "./models/PostModel.js";

const app = express();
app.use(cors());
app.use(express.json());

// === SERVE UPLOADED IMAGES ===
app.use("/uploads", express.static("uploads"));

// === MULTER SETUP FOR IMAGE UPLOAD ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // store images inside /uploads folder
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "");
    cb(null, Date.now() + "-" + safeName); // unique filename
  },
});

const upload = multer({ storage });

// --- DB connection ---
const connectionString =
  "mongodb+srv://admin:admin@students.ll5gldx.mongodb.net/PulseDb?appName=students";

mongoose
  .connect(connectionString)
  .then(() => {
    console.log("Database Connected..");

    app.listen(6969, () => {
      console.log("Server connected at port number 6969..");
    });
  })
  .catch((error) => {
    console.log("Database connection error: " + error);
  });

/* ===========================================================
                     USER ROUTES
=========================================================== */

// POST /register  -> create user
app.post("/register", async (req, res) => {
  try {
    const {
      fname,
      lname,
      email,
      password,
      address,
      phnum,
      age,
      gender,
      username,
    } = req.body;

    if (!fname || !lname || !email || !password || !username) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // check email
    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // check username
    const existingUsername = await UserModel.findOne({
      username: username.toLowerCase(),
    });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const user = await UserModel.create({
      fname,
      lname,
      email,
      password,
      address,
      phnum,
      age,
      gender,
      username: username.toLowerCase(),
    });

    return res.status(201).json({
      message: "Registered successfully",
      user,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error during register" });
  }
});

// GET /check-username?username=foo
app.get("/check-username", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ available: false, message: "No username provided" });
    }

    const existing = await UserModel.findOne({
      username: username.toLowerCase(),
    });

    if (existing) {
      return res.json({ available: false, message: "Username already taken" });
    }

    return res.json({ available: true, message: "Username is available" });
  } catch (err) {
    console.error("Check username error:", err);
    return res.status(500).json({ available: false, message: "Server error" });
  }
});



// POST /login  -> check credentials
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    return res.json({
      message: "Login successful",
      user,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
});

// GET /users  -> list all registered users
app.get("/users", async (req, res) => {
  try {
    const users = await UserModel.find().sort({ fname: 1 });
    return res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    return res.status(500).json({ message: "Error fetching users" });
  }
});

// POST /posts  (fields: authorId, text, optional "media" file)
app.post("/posts", upload.single("media"), async (req, res) => {
  try {
    const { authorId, text } = req.body;

    if (!authorId) {
      return res.status(400).json({ message: "authorId is required" });
    }

    let mediaUrl = "";
    let mediaType = "";

    if (req.file) {
      mediaUrl = `http://localhost:6969/uploads/${req.file.filename}`;
      mediaType = req.file.mimetype.startsWith("video") ? "video" : "image";
    }

    const post = await PostModel.create({
      author: authorId,
      text: text || "",
      mediaUrl,
      mediaType,
    });

    const populated = await post.populate("author", "username fname lname profilePic");

    return res.status(201).json({ message: "Post created", post: populated });
  } catch (err) {
    console.error("Create post error:", err);
    return res.status(500).json({ message: "Error creating post" });
  }
});


// GET /feed/:userId
app.get("/feed/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const authorIds = [user._id, ...user.following];

const posts = await PostModel.find({ author: { $in: authorIds } })
  .sort({ createdAt: -1 })
  .populate("author", "username fname lname profilePic")
  .populate("comments.author", "username fname lname profilePic");

    return res.json(posts);
  } catch (err) {
    console.error("Feed error:", err);
    return res.status(500).json({ message: "Error fetching feed" });
  }
});

// GET /users/:username/profile
app.get("/users/:username/profile", async (req, res) => {
  try {
    const { username } = req.params;

    const user = await UserModel.findOne({ username: username.toLowerCase() })
      .select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

const posts = await PostModel.find({ author: user._id })
  .sort({ createdAt: -1 })
  .populate("author", "username fname lname profilePic")
  .populate("comments.author", "username fname lname profilePic");


    return res.json({ user, posts });
  } catch (err) {
    console.error("Profile error:", err);
    return res.status(500).json({ message: "Error fetching profile" });
  }
});


// POST /users/:id/follow  { targetId }
// POST /users/:id/follow  { targetId }
app.post("/users/:id/follow", async (req, res) => {
  try {
    const { id } = req.params;       // current user
    const { targetId } = req.body;   // user to follow

    if (id === targetId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const user = await UserModel.findById(id);
    const target = await UserModel.findById(targetId);
    if (!user || !target) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ avoid duplicates using toString()
    const alreadyFollowing = (user.following || []).some(
      (u) => u.toString() === targetId
    );
    if (!alreadyFollowing) {
      user.following.push(targetId);
      await user.save();
    }

    const alreadyFollower = (target.followers || []).some(
      (u) => u.toString() === id
    );
    if (!alreadyFollower) {
      target.followers.push(id);
      await target.save();
    }

    return res.json({ message: "Followed", user });
  } catch (err) {
    console.error("Follow error:", err);
    return res.status(500).json({ message: "Error following user" });
  }
});


// POST /users/:id/unfollow  { targetId }
app.post("/users/:id/unfollow", async (req, res) => {
  try {
    const { id } = req.params;
    const { targetId } = req.body;

    const user = await UserModel.findById(id);
    const target = await UserModel.findById(targetId);
    if (!user || !target) {
      return res.status(404).json({ message: "User not found" });
    }

    user.following = user.following.filter(
      (u) => u.toString() !== targetId
    );
    target.followers = target.followers.filter(
      (u) => u.toString() !== id
    );

    await user.save();
    await target.save();

    return res.json({ message: "Unfollowed", user });
  } catch (err) {
    console.error("Unfollow error:", err);
    return res.status(500).json({ message: "Error unfollowing user" });
  }
});



/* ===========================================================
        🔥 UPLOAD PROFILE PICTURE ROUTE
=========================================================== */

// POST /users/:id/profile-pic
app.post("/users/:id/profile-pic", upload.single("image"), async (req, res) => {
  try {
    const userId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imageUrl = `http://localhost:6969/uploads/${req.file.filename}`;

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { profilePic: imageUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Profile picture updated",
      user,
    });
  } catch (err) {
    console.error("Profile pic upload error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


// DELETE /posts/:id  (body: { authorId })
app.delete("/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const { authorId } = req.body;

    if (!authorId) {
      return res
        .status(400)
        .json({ message: "authorId is required to delete post" });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // only the original author can delete
    if (post.author.toString() !== authorId) {
      return res.status(403).json({ message: "Not allowed to delete this post" });
    }

    await PostModel.findByIdAndDelete(postId);

    return res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("Delete post error:", err);
    return res.status(500).json({ message: "Error deleting post" });
  }
});

// POST /posts/:id/like  -> toggle like/unlike by userId
app.post("/posts/:id/like", async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const post = await PostModel.findById(postId).populate(
      "author",
      "username fname lname profilePic"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId
    );

    if (alreadyLiked) {
      // UNLIKE
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      // LIKE
      post.likes.push(userId);
    }

    await post.save();

    return res.json({
      message: alreadyLiked ? "Unliked" : "Liked",
      post,
    });
  } catch (err) {
    console.error("Like toggle error:", err);
    return res.status(500).json({ message: "Error toggling like" });
  }
});


// POST /posts/:id/comment  -> add comment { userId, text }
app.post("/posts/:id/comment", async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId, text } = req.body;

    if (!userId || !text || !text.trim()) {
      return res
        .status(400)
        .json({ message: "userId and non-empty text are required" });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      author: userId,
      text: text.trim(),
    });

    await post.save();

    // re-fetch with population so frontend gets full author info
    const populated = await PostModel.findById(post._id)
      .populate("author", "username fname lname profilePic")
      .populate("comments.author", "username fname lname profilePic");

    return res.json({
      message: "Comment added",
      post: populated,
    });
  } catch (err) {
    console.error("Add comment error:", err);
    return res.status(500).json({ message: "Error adding comment" });
  }
});

// GET /posts/discover  -> all posts, newest first
app.get("/posts/discover", async (req, res) => {
  try {
    const posts = await PostModel.find({})
      .sort({ createdAt: -1 })
      .populate("author", "username fname lname profilePic");

    return res.json(posts);
  } catch (err) {
    console.error("Discover posts error:", err);
    return res
      .status(500)
      .json({ message: "Error fetching discover feed" });
  }
});
