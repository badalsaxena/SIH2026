const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET;

const payload = {
    id : 1,
    username : "surveyor_test",
    role : "Surveyor"
};

const token = jwt.sign(payload, secret);
console.log(token);