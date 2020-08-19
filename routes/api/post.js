const express = require("express");
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const router = express.Router();

const User = require("../../models/User");
const Post = require("../../models/Post");

/**
 * @route         Post api/post
 * @description   Create a post
 * @acess          Private
 */

router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      //Get user making post excluding the password using the select function
      const user = await User.findById(req.user.id).select("-password");

      //create a new post object
      const newPost = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      const post = new Post(newPost);

      await post.save();

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).json("Server Error");
    }
  }
);

/**
 * @route         GET api/post
 * @description   Get all post
 * @acess          Private
 */

router.get("/", auth, async (req, res) => {
  try {
    //Get all posts available
    const posts = await Post.find().sort({ date: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

/**
 * @route         GET api/post/:id
 * @description   Get single post
 * @acess          Private
 */

router.get("/:id", auth, async (req, res) => {
  try {
    //Get single post
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(200).json(post);
  } catch (err) {
    if (err.kind === "ObjectId") {
      console.error(err.message);

      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).json("Server Error");
  }
});

/**
 * @route         DELETE api/post
 * @description   DELETE single post
 * @acess          Private
 */

router.delete("/:id", auth, async (req, res) => {
  try {
    //Get single post
    const post = await Post.findById(req.params.id);

    //Check
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    await post.remove();
    res.status(200).json({ msg: "Post removed " });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).json("Server Error");
  }
});

/**
 * @route         PUT api/post/like/:id
 * @description   like single post
 * @acess          Private
 */

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if post does not exist
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    //if post already liked by user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post Already Liked" });
    }
    //Add user to liked list
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).json("Server Error");
  }
});

/**
 * @route         PUT api/post/unlike/:id
 * @description   like single post
 * @acess          Private
 */

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if post does not exist
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    //if post already liked by user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post Has Not Been Liked" });
    }
    //Get remove index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    //Remove like of the user on post
    post.likes.splice(removeIndex, 1);

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).json("Server Error");
  }
});

/**
 * @route         Post api/post/comment/:id
 * @description   Comment on a post
 * @acess          Private
 */

router.post(
  "/comment/:id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      //Get user making post excluding the password using the select function
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);
      //create a new Comment object
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      //add new comment to post commented
      post.comments.unshift(newComment);

      await post.save();

      console.log(post.comments);
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).json("Server Error");
    }
  }
);

/**
 * @route         DELETE api/post/comment/:id/:comment_id
 * @description   DELETE single comment
 * @acess          Private
 */

router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    //Get single post
    const post = await Post.findById(req.params.id);
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    //Check if user created comment to be deleted
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    //Get remove index
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);

    //remove comment
    post.comments.splice(removeIndex, 1);
    post.save();
    res.status(200).json(post.comments);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).json("Server Error");
  }
});

module.exports = router;
