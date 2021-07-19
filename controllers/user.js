var express = require('express');
const { exec } = require("child_process")
var fs = require('fs');
var path = require('path');
var glob = require("glob");
const util = require('util');
const readFile = util.promisify(fs.readFile);
const readdir = util.promisify(fs.readdir)
const fileexists = util.promisify(fs.exists)

const { User, Video } = require('../models/models');
const { roles } = require('../roles/roles')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

const playerController = require('../controllers/player');

// ====== user control ======
const cookieOptions = {
  path:"/",
  sameSite:true,
  maxAge: 1000 * 60 * 60 * 24, // TODO: not needed here
  httpOnly: true, // The cookie only accessible by the web server
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

exports.signup = async (req, res, next) => {
  try {
    const { email, password, role } = req.body
    const user = await User.findOne({ email });
    if (user) return next(new Error('Email exists'));
    const hashedPassword = await hashPassword(password);
    const newUser = new User({ email, password: hashedPassword, role: role || "basic" });
    const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });
    newUser.accessToken = accessToken;
    await newUser.save();

    res.cookie('x-access-token', accessToken, cookieOptions)
    res.json({
      data: newUser,
      accessToken
    })
  } catch (error) {
    next(error)
  }
}

exports.login = async (req, res, next) => {
  try {
   const { email, password } = req.body;
   const user = await User.findOne({ email });
   if (!user) return next(new Error('Email does not exist'));
   const validPassword = await validatePassword(password, user.password);
   if (!validPassword) return next(new Error('Password is not correct'))
   const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d"
   });
   await User.findByIdAndUpdate(user._id, { accessToken })

   res.cookie('x-access-token', accessToken, cookieOptions)

   res.status(200).json({
    data: { email: user.email, role: user.role },
    accessToken
   })
  } catch (error) {
   next(error);
  }
}

exports.getUsers = async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
      data: users
  });
}

exports.getUser = async (req, res, next) => {
  try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
      if (!user) return next(new Error('User does not exist'));
      res.status(200).json({
          data: user
      });
  } catch (error) {
      next(error)
  }
}

exports.updateUser = async (req, res, next) => {
  try {
      const update = req.body
      const userId = req.params.userId;
      await User.findByIdAndUpdate(userId, update);
      const user = await User.findById(userId)
      res.status(200).json({
          data: user,
          message: 'User has been updated'
      });
  } catch (error) {
      next(error)
  }
}

exports.deleteUser = async (req, res, next) => {
  try {
      const userId = req.params.userId;
      await User.findByIdAndDelete(userId);
      res.status(200).json({
          data: null,
          message: 'User has been deleted'
      });
  } catch (error) {
      next(error)
  }
}

exports.grantAccess = function(action, resource) {
  return async (req, res, next) => {
      try {
      const permission = roles.can(req.user.role)[action](resource);
      if (!permission.granted) {
          return res.status(401).json({
              error: "You don't have enough permission to perform this action"
          });
      }
      next()
      } catch (error) {
          next(error)
      }
  }
}

exports.allowIfLoggedin = async (req, res, next) => {
  try {
    const user = res.locals.loggedInUser;
    if (!user)
        return res.status(401).json({
            error: "You need to be logged in to access this route"
        });
    req.user = user; // not necessary
    next();
  } catch (error) {
      next(error);
  }
}

// ====== user video list ======

// name, link, completed or not, delete button, preview video

var download_path = 'downloads'

// Home page route.
exports.loadVideos = async (req, res) => {
  const user = res.locals.loggedInUser;
  var videoList = user.videoList;
  var video, token, url, website, completed;
  var srcUrl;
  var urlComp;
  var m3u8ID, previewUrl;
  var name_src_completed_preview=[];
  var new_completed;

  for(i = 0; i < videoList.length; i++){
    video = await Video.findById(videoList[i])
    token = video.token;
    url = video.url;
    website = video.website;
    // TODO: check completed?
    completed = video.completed;
    // m3u8ID = path.parse(token).name;
    m3u8ID = token;
    previewUrl = path.join(m3u8ID, 'preview.mp4')
    new_completed = await fileexists(path.join(download_path, previewUrl))
    if (new_completed != completed){
      completed = new_completed;
      video.completed = new_completed;
      await video.save();
    }

    if(website.length == 0){
      urlComp = url.split('/')
      if (urlComp.length<2)
        website=urlComp[0].split('.')[0]
      else
        website=urlComp.slice(urlComp.length-2, urlComp.length).join('_').split('.')[0]
      srcUrl = "player?uri="+encodeURIComponent(url)
    }
    else{
      srcUrl = "player?uri="+encodeURIComponent(url)+"&rf="+encodeURIComponent(website)
    }

    name_src_completed_preview.unshift({'name': website, 'url': srcUrl, 'completed': completed?'Completed':'Not finished', 'src': previewUrl, 'iid': m3u8ID})
  }
  
  res.render('user', {'meta': name_src_completed_preview})
}

// TODO
// need to refresh, since we changed index id
exports.redownload = async function (req, res) {
  var m3u8ID = req.query.iid
  var token = m3u8ID
  const video = await Video.findOne({ token })
  if(!video) return

  playerController.download_url(video.url, video)

  if(m3u8ID != '')
    exec(`rm -rf ${download_path}/${m3u8ID}*`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}

exports.deleteVideo = async function (req, res) {
  var m3u8ID = req.query.iid
  var token = m3u8ID
  const video = await Video.findOne({ token })
  if(!video) return
  var vid = video._id;
  await Video.findByIdAndDelete(vid);
  var user = res.locals.loggedInUser;
  var videoList = user.videoList
  for(var i = 0; i < videoList.length; i++){
    if(vid.toString() == videoList[i].toString()){
      videoList.splice(i, 1);
    }
  }
  user.videoList = videoList;
  await user.save();

  if(m3u8ID != '')
    exec(`rm -rf ${download_path}/${m3u8ID}*`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}