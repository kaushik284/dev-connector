const jwt = require('jsonwebtoken');
const config = require('config');

//create custom middleware for authorization
module.exports = function (req, res, next) {
    //get the token from request header
    const token = req.header('x-auth-token');
    //console.log(token);
    //check if token is not present
    if (!token) {
        return res.status(401).json({ errors: [{ msg: 'No token, authorization denied' }] });
    }

    //verify the token if present
    try {
        //const decoded = jwt.verify(token, config.get('jwtSecret'));
        //req.user = decode.user.id;
        //next();
        jwt.verify(token, config.get('jwtSecret'), (error, decoded) => {
            if (error) {
                res.status(401).json({ msg: 'Token is invalid' });
            }
            else {
                req.user = decoded.user;
                next();
            }
        })
    }
    catch (err) {
        res.status(401).json({ errors: [{ msg: 'Token is not valid' }] });
    }
};