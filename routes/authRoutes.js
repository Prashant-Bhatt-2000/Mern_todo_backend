const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
const router = express.Router();
const User = require('../models/User');


dotenv.config({path: './config/config.env'})
router.post('/createuser', async (req, resp) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    return resp.status(400).json({ message: 'Please fill in all fields properly' });
  }

  if (password !== confirmPassword) {
    return resp.status(400).json({ message: "Passwords do not match" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const confirmhashedpassword = await bcrypt.hash(confirmPassword, 10);

  const userExists =  await User.findOne({ email });

  if (userExists) {
    return resp.status(400).json({ message: "User already exists" });
  }

  const user = new User({ username, email, password: hashedPassword, confirmPassword: confirmhashedpassword});

  await user.save();

  return resp.status(200).json({ message: "User created successfully" });
});


router.post('/login', async(req, resp)=>  { 
    const { email , password } = req.body

    if(!email || !password){ 
        return resp.status(400).send({message:'Please provide an email and a password'})
    }

    const user = await User.findOne({email})

    if(!user)
    { 
        return resp.status(400).send({message:"Email or Password is incorrect"})
    }

    const comparePassword = await bcrypt.compare(password, user.password)

    if(!comparePassword)
    {
        return resp.status(400).json({'message': 'Invalid Credentials'}) 
    }


    const payload = { 
        user: { 
            id : user.id
        }
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '2h'})

    resp.cookie('token', token, {
      expires: new Date(Date.now() + 2 * 60 * 60 * 1000), 
      httpOnly: false, 
    });
  

    return resp.status(200).json({ 'message': 'Login Success', 'token': token})
})

module.exports = router;
