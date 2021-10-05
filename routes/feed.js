const express = require('express');
const { body } = require('express-validator/check');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();


//POST /feed/twitter

router.post('/twitter', isAuth, 
[
  body('token')
    .trim()
],feedController.postTwitter);

// router.post('/twitter',
// [
//   body('token')
//     .trim()
// ],feedController.postTwitter);



module.exports = router;
