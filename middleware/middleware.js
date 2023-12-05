const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')


dotenv.config({path: './config/config.env'})

const middleware = (req, resp, next)=> { 
    let token = req.header('token');
    if (!token){ 
        return resp.status(401).send({msg: 'You are not authorize to access this route.!'});  
    } 
    try{
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data.user
        next();
    } catch(err){
            return resp.status(401).send({msg: "Token is not valid!"});
    }

}

module.exports = middleware