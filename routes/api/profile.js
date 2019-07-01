const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');


const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try{
    const profile = await Profile.findOne({ user : req.user.id }).populate('user',['name', 'avatar']);
    if(!profile){
        return res.status(400).json({msg:'there is no profile for this user'});
    }
    res.json(profile);
  }  catch(err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }

});  

// @route   POST api/profile
// @desc    create or update user profile
// @access  Private

router.post('/', 
[ 
    auth,
    [
        check('status', 'status is required').not().isEmpty(),
        check('skills', 'skills is required').not().isEmpty()
    ] 
],
async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors : errors.array() });
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
    linkedin
  } = req.body;

  // Get fields
  const profileFields = {};
  profileFields.user = req.user.id;
  if (company) profileFields.company = company;
  if (website) profileFields.website = website;
  if (location) profileFields.location = location;
  if (status) profileFields.status = status;
  if (bio) profileFields.bio = bio;
  if (githubusername) profileFields.githubusername = githubusername;
  // Skills - Spilt into array
  if (skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim());
  }
  // Social (optional fields)
  profileFields.social = {};
  if (youtube) profileFields.social.youtube = youtube;
  if (twitter) profileFields.social.twitter = twitter;
  if (facebook) profileFields.social.facebook = facebook;
  if (linkedin) profileFields.social.linkedin = linkedin;
  if (instagram) profileFields.social.instagram = instagram;

  try{
    let profile = await Profile.findOne({user:req.user.id});
    if(profile){
      //Update
      profile = await Profile.findOneAndUpdate(
       {user : req.user.id},
       {$set : profileFields},
       {new:true}
      );

      return res.json(profile);
    }

    //Create
    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);
  } catch (err){
    console.log(err.message);
    res.status(500).send('Server error');
  }

});

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});  


// @route   GET api/profile/user/:user_id
// @desc    Get all profiles
// @access  Public

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({user:req.params.user_id}).populate('user', ['name', 'avatar']);
    if(!profile){
       return res.status(400).json({msg:"profile not found"});
    }
    res.json(profile);
  } catch (error) {
    if(error.kind === 'ObjectId' ) return res.status(400).json({msg:"profile not found"});
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   Delete api/profile
// @desc    Delete all profiles
// @access  Private

router.delete('/', auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({user:req.user.id});
    await User.findOneAndRemove({ _id:req.user.id });
    res.json({msg : "user deleted"});
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private

router.put('/experience', [
  auth,
  [
    check('title', "Title is required").not().isEmpty(),
    check('company', "Company is required").not().isEmpty(),
    check('from', "From date is required").not().isEmpty()
  ]
], async (req, res) => {

  const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({ errors : errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {

      title,
      company,
      location,
      from,
      to,
      current,
      description
    }

    try {
      
      const profile = await Profile.findOne({user:req.user.id});
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
});


// @route   Delete api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({user:req.user.id});
    const removeIndex = profile.experience.map(item=>item.id).indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;