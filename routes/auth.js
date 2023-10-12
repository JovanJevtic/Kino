const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authHandler');

const { 
    confirmEmail,
    login,
    register,
    me,
    resendConfirmEmail
} = require('../services/auth');

//? 
router.post('/', register);
router.post('/confirmEmail', confirmEmail)
router.post('/resendConfirmEmail', resendConfirmEmail)        
router.post('/login', login);
router.get('/me', me);


module.exports = router;