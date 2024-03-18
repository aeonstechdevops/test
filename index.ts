const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const router = require("./routes/users-route");
const auth_routes = require("./routes/auth_routes");
const path = require("path");
const ejs = require("ejs");
const User = require("./model/users");
const cors = require("cors");
const port = process.env.PORT || 4000;
// storage
const { storage } = require("./storage/storage");
const multer = require("multer");
const upload = multer({ storage });

const app = express();

app.use(express.json());
app.use(cors());

app.post("/users/", upload.single("image"), async (req, res) => {
  try {
    // Handle file upload
    console.log("request file:", req.file.path);
    const result = req.file.path;

    // Handle user registration
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 6) {
      return next(new HttpError("Please enter all the fields.", 422));
    }

    let user = new User({
      name,
      email,
      password,
      file: result, // Assuming you have a field in your user model for the profile image path
    });

    user = await user.save();

    if (!user) {
      return next(
        new HttpError("Adding user failed, please try again later.", 500)
      );
    }

    // Convert ObjectId to 6-digit number
    const sixDigitId = parseInt(user._id.toString().substring(18, 24), 16);

    // Update user with sixDigitId
    user = await User.findByIdAndUpdate(user._id, { sixDigitId });

    return res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Internal Server Error", 500));
  }
});

app.post(
  "/users/multiple/",
  upload.array("images", 10),
  async (req, res, next) => {
    try {
      // Handle file uploads
      console.log("request req.files :", req.files);
      const files = req.files;
      console.log("request files :", files);
      const filePaths = files.map((file) => file.path);
      console.log("request filePaths :", filePaths);

      // Handle user registration
      const { name, email, password } = req.body;

      let user = new User({
        name,
        email,
        password,
        files: filePaths, // Assuming you have a field in your user model for an array of profile image paths
      });

      user = await user.save();

      if (!user) {
        return next(
          new HttpError("Adding user failed, please try again later.", 500)
        );
      }

      // Convert ObjectId to 6-digit number
      const sixDigitId = parseInt(user._id.toString().substring(18, 24), 16);

      // Update user with sixDigitId
      user = await User.findByIdAndUpdate(user._id, { sixDigitId });

      return res.status(201).json({ user });
    } catch (err) {
      console.error(err);
      // return next(new HttpError("Internal Server Error", 500));
      console.log("Internal Server Error");
    }
  }
);

// upload the images
app.put("/users/:id", upload.array("images", 10), async (req, res, next) => {
  try {
    // Handle file uploads
    // const { name, email } = req.body;
    // const userId = req.params.id;
    const userId = req.params.id;
    console.log("userId : ", userId);
    console.log("request req.files :", req.files);
    const files = req.files;
    console.log("request files :", files);
    const filePaths = files.map((file) => file.path);
    console.log("request filePaths :", filePaths);

    // Handle user registration
    const { name, email } = req.body;
    let user;
    user = await User.findByIdAndUpdate(userId, {
      name,
      email,
      files: filePaths,
    });
    user = await user.save();

    if (!user) {
      return next(
        new HttpError("Adding user failed, please try again later.", 500)
      );
    }

    return res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    // return next(new HttpError("Internal Server Error", 500));
    console.log("Internal Server Error");
  }
});

// update images
app.put("/images/:id", upload.array("images", 10), async (req, res, next) => {
  try {
    const userId = req.params.id;
    console.log("userId : ", userId);
    const files = req.files;
    console.log("request files :", files);
    const filePaths = files.map((file) => file.path);
    console.log("request filePaths :", filePaths);

    const user = await User.findByIdAndUpdate(userId, {
      files: filePaths, // Assuming you have a field in your user model for an array of profile image paths
    });
    console.log("user", user);

    user = await user.save();

    if (!user) {
      return next(
        new HttpError("Adding user failed, please try again later.", 500)
      );
    }

    return res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Internal Server Error", 500));
  }
});

app.get("/", (req, res) => res.send("Express on Vercel"));

app.use("/users", router);
app.use("/api", auth_routes);
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to mongo");
  })
  .catch((error) => {
    console.log("Connection failed", error);
  });

app.listen(port, () => {
  console.log("Server is running on port 5000");
});
