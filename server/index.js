import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "./models/UserModel.js";
import PostModel from "./models/PostModel.js";

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 in real projects use process.env.JWT_SECRET
const JWT_SECRET = "super-secret-pulse-key-change-this";

// 🔐 Simple JWT auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // { userId, email, username, role }
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

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

// POST /register  -> create user with hashed password
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

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      fname,
      lname,
      email,
      password: hashedPassword,
      address,
      phnum,
      age,
      gender,
      username: username.toLowerCase(),
    });

    // don't send password back
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({
      message: "Registered successfully",
      user: userObj,
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
      return res
        .status(400)
        .json({ available: false, message: "No username provided" });
    }

    const existing = await UserModel.findOne({
      username: username.toLowerCase(),
    });

    if (existing) {
      return res.json({
        available: false,
        message: "Username already taken",
      });
    }

    return res.json({ available: true, message: "Username is available" });
  } catch (err) {
    console.error("Check username error:", err);
    return res.status(500).json({ available: false, message: "Server error" });
  }
});

// POST /login  -> check credentials + return JWT
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password required" });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 🔐 compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // create JWT payload (role from isAdmin)
    const payload = {
      userId: user._id,
      email: user.email,
      username: user.username,
      role: user.isAdmin ? "admin" : "user",
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    // don't send password back
    const userObj = user.toObject();
    delete userObj.password;

    return res.json({
      message: "Login successful",
      token,
      user: userObj,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
});

// GET /users  -> admin only, list all registered users (no password)
app.get("/users", authMiddleware, async (req, res) => {
  try {
    // only admins can see all users
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const users = await UserModel.find()
      .sort({ fname: 1 })
      .select("-password");

    return res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    return res.status(500).json({ message: "Error fetching users" });
  }
});


// GET /auth/me -> verify token and return fresh user (no password)
app.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (err) {
    console.error("/auth/me error:", err);
    return res.status(500).json({ message: "Error fetching current user" });
  }
});


app.post(
  "/posts",
  authMiddleware,
  upload.single("media"),
  async (req, res) => {
    try {
      const { text, location } = req.body;   // 👈 now reading location
      const authorId = req.user.userId;

      if (!authorId) {
        return res.status(401).json({ message: "Not authorized" });
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
        location: location || "",   // 👈 save location here
        mediaUrl,
        mediaType,
      });

      const populated = await post.populate(
        "author",
        "username fname lname profilePic"
      );

      return res
        .status(201)
        .json({ message: "Post created", post: populated });
    } catch (err) {
      console.error("Create post error:", err);
      return res.status(500).json({ message: "Error creating post" });
    }
  }
);


// DELETE /posts/:id  -> only author can delete (author from token)
app.delete("/posts/:id", authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const currentUserId = req.user.userId;

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== currentUserId) {
      return res
        .status(403)
        .json({ message: "Not allowed to delete this post" });
    }

    await PostModel.findByIdAndDelete(postId);

    return res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("Delete post error:", err);
    return res.status(500).json({ message: "Error deleting post" });
  }
});

// POST /posts/:id/like  -> toggle like/unlike (user from token)
app.post("/posts/:id/like", authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const post = await PostModel.findById(postId).populate(
      "author",
      "username fname lname profilePic"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      // UNLIKE
      post.likes = post.likes.filter((id) => id.toString() !== userId);
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

// POST /posts/:id/comment  -> add comment { text } (user from token)
app.post("/posts/:id/comment", authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const { text } = req.body;
    const userId = req.user.userId;

    if (!userId || !text || !text.trim()) {
      return res
        .status(400)
        .json({ message: "Non-empty text required" });
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

// GET /posts/discover  -> all posts, newest first (public)
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

// GET /posts/following/:userId  -> posts ONLY from people the user follows
app.get("/posts/following/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    if (currentUserId !== userId) {
      return res
        .status(403)
        .json({ message: "Cannot view another user's following feed" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const followingIds = user.following || [];

    if (followingIds.length === 0) {
      return res.json([]);
    }

    const posts = await PostModel.find({ author: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .populate("author", "username fname lname profilePic")
      .populate("comments.author", "username fname lname profilePic");

    return res.json(posts);
  } catch (err) {
    console.error("Following feed error:", err);
    return res.status(500).json({ message: "Error fetching following feed" });
  }
});

// GET /feed/:userId  -> user + following feed (protected)
app.get("/feed/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    if (currentUserId !== userId) {
      return res
        .status(403)
        .json({ message: "Cannot view another user's feed" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const authorIds = [user._id, ...(user.following || [])];

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

/* ===========================================================
                     PROFILE ROUTES
=========================================================== */

// GET /users/:username/profile  (public profile)
app.get("/users/:username/profile", async (req, res) => {
  try {
    const { username } = req.params;

    const user = await UserModel.findOne({
      username: username.toLowerCase(),
    }).select("-password");
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

/* ===========================================================
                     FOLLOW / UNFOLLOW
=========================================================== */

// POST /users/:id/follow  { targetId }
app.post("/users/:id/follow", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params; // current user (URL)
    const { targetId } = req.body; // user to follow
    const currentUserId = req.user.userId;

    if (currentUserId !== id) {
      return res
        .status(403)
        .json({ message: "Cannot follow as another user" });
    }

    if (id === targetId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const user = await UserModel.findById(id);
    const target = await UserModel.findById(targetId);
    if (!user || !target) {
      return res.status(404).json({ message: "User not found" });
    }

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

    // 🔐 don't send password hash back
    const userObj = user.toObject();
    delete userObj.password;

    return res.json({ message: "Followed", user: userObj });
  } catch (err) {
    console.error("Follow error:", err);
    return res.status(500).json({ message: "Error following user" });
  }
});

// POST /users/:id/unfollow  { targetId }
app.post("/users/:id/unfollow", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { targetId } = req.body;
    const currentUserId = req.user.userId;

    if (currentUserId !== id) {
      return res
        .status(403)
        .json({ message: "Cannot unfollow as another user" });
    }

    const user = await UserModel.findById(id);
    const target = await UserModel.findById(targetId);
    if (!user || !target) {
      return res.status(404).json({ message: "User not found" });
    }

    user.following = user.following.filter((u) => u.toString() !== targetId);
    target.followers = target.followers.filter((u) => u.toString() !== id);

    await user.save();
    await target.save();

    // 🔐 don't send password hash back
    const userObj = user.toObject();
    delete userObj.password;

    return res.json({ message: "Unfollowed", user: userObj });
  } catch (err) {
    console.error("Unfollow error:", err);
    return res.status(500).json({ message: "Error unfollowing user" });
  }
});

/* ===========================================================
        🔥 UPLOAD PROFILE PICTURE ROUTE
=========================================================== */

// POST /users/:id/profile-pic
app.post(
  "/users/:id/profile-pic",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const userId = req.params.id;
      const currentUserId = req.user.userId;

      if (userId !== currentUserId) {
        return res
          .status(403)
          .json({ message: "Cannot change another user's profile picture" });
      }

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

      // 🔐 don't send password
      const userObj = user.toObject();
      delete userObj.password;

      return res.json({
        message: "Profile picture updated",
        user: userObj,
      });
    } catch (err) {
      console.error("Profile pic upload error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/* ===========================================================
              FOLLOWING / FOLLOWERS LISTS
=========================================================== */

// GET /users/:id/following-list -> who this user follows
app.get("/users/:id/following-list", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.userId;

    if (currentUserId !== id) {
      return res
        .status(403)
        .json({ message: "Cannot view another user's following list" });
    }

    const user = await UserModel.findById(id)
      .populate("following", "username fname lname profilePic")
      .select("following");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user.following || []);
  } catch (err) {
    console.error("Following list error:", err);
    return res
      .status(500)
      .json({ message: "Error fetching following list" });
  }
});

// GET /users/:id/followers-list -> who follows this user
app.get("/users/:id/followers-list", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.userId;

    if (currentUserId !== id) {
      return res
        .status(403)
        .json({ message: "Cannot view another user's followers list" });
    }

    const user = await UserModel.findById(id)
      .populate("followers", "username fname lname profilePic")
      .select("followers");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user.followers || []);
  } catch (err) {
    console.error("Followers list error:", err);
    return res
      .status(500)
      .json({ message: "Error fetching followers list" });
  }
});


app.put("/posts/:id", authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const currentUserId = req.user.userId;
    const { text, location } = req.body;

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== currentUserId) {
      return res
        .status(403)
        .json({ message: "Not allowed to edit this post" });
    }

    if (typeof text === "string") post.text = text;
    if (typeof location === "string") post.location = location;

    await post.save();

    const populated = await PostModel.findById(post._id)
      .populate("author", "username fname lname profilePic")
      .populate("comments.author", "username fname lname profilePic");

    return res.json({
      message: "Post updated",
      post: populated,
    });
  } catch (err) {
    console.error("Update post error:", err);
    return res.status(500).json({ message: "Error updating post" });
  }
});

