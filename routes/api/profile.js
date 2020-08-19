const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const request = require("request");
const config = require("config");

const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { response } = require("express");
const Post = require("../../models/Post");

/**
 * @route         GET api/profile/me
 * @description   Get profile of current user using token
 * @acess          Private
 */

router.get("/me", auth, async (req, res) => {
  try {
    //get profile using user's id
    //Populate access the User model  to get the user's name and avatar from there

    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "Profile Not Found" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @route        POST api/profile
 * @description   create or update profile of current user using token
 * @acess          Private
 */
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }
    //Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        //update profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      //Create profile
      if (!profile) {
        profile = new Profile(profileFields);
        await profile.save();

        return res.json(profile);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

/**
 * @route         GET api/profile
 * @description   Get all profiles
 * @acess          Public
 */

router.get("/", async (req, res) => {
  try {
    //Get all profiles from database, taking only userID and name
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @route         GET api/profile/usr/:user_id
 * @description   Get a user's profile by user_id
 * @acess          Public
 */

router.get("/user/:user_id", async (req, res) => {
  try {
    /**
     * Get a user's profile from database by user_id
     *  get avatar and name from User collection
     * and add it to the profile using populate function
     */
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ msg: "Profile Not Found" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "IProfile Not Found" });
    }
    res.status(500).send("Server Error");
  }
});

/**
 * @route         DELETE api/profile
 * @description   DELETE profile, user and posts[Delete Account and its details]
 * @acess          Public
 */

router.delete("/", auth, async (req, res) => {
  try {
    //TODO: REmove posts
    await Post.deleteMany({ user: req.user.id });
    //REmove profile from database
    await Profile.findOneAndRemove({ user: req.user.id });
    //Remove User
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User Deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
/**
 * @route         PUT api/profile/experienc
 * @description   Add profile experience
 * @acess          Private
 */
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "company is required").not().isEmpty(),
      check("from", "Start From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExperience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      //Get logged in user's profile
      const profile = await Profile.findOne({ user: req.user.id });
      //Add newExperience to profile
      profile.experience.unshift(newExperience);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);

/**
 * @route         DELETE api/profile/experience/:exp_id
 * @description   DELETE profile experience
 * @acess          Private
 */
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    //Get profile of logged in user
    const profile = await Profile.findOne({ user: req.user.id });

    //Get index of experience to be removed
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @route         PUT api/profile/education
 *
 * @description   Add profile education
 * @acess          Private
 */
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("from", "Start From date is required").not().isEmpty(),

      check("fieldofstudy", "field of study is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      //Get logged in user's profile
      const profile = await Profile.findOne({ user: req.user.id });
      //Add newEducation to profile
      profile.education.unshift(newEducation);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);

/**
 * @route         DELETE api/profile/education/:edu_id
 * @description   DELETE profile education
 * @acess          Private
 */
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    //Get profile of logged in user
    const profile = await Profile.findOne({ user: req.user.id });

    //Get index of education to be removed
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @route         GET api/profile/github/:username
 * @description   Get user repos from Github
 * @acess          Public
 */

router.get("/github/:username", (req, res) => {
  try {
    ///Get github api options
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };
    //use request package to access github
    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "No Profile Found" });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
