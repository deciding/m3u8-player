const { User, Video } = require('../models/models')
const { roles } = require('../roles/roles')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
 
exports.portal = async (req, res, next) => {
    try{
        res.render("login")
    }
    catch (error){
        next(error)
    }
}