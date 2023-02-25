const express = require('express');
//initialize the router
const router = express.Router();
router.post('/auth/login', (req, res, next) => {
    res.send('SignIn')
});
router.post('/auth/signUp', (req, res, next) => {
    res.send("SignUp api");
});

router.delete('/auth/logout/', (req, res, next) => {
    res.send('Logout');
});


module.exports = router;
