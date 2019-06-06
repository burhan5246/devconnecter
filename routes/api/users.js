const express = require('express');
const router = express.Router();

// @route   Post api/posts
// @desc    Registering user
// @access  public
router.post('/', (req, res) => { 
    console.log(req.body);
    res.send('User Route');
 }); 

module.exports = router;