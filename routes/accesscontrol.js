const express = require('express');
const router = express.Router();
const viewController = require('../controllers/view');
const userController = require('../controllers/user');
const playerController = require('../controllers/player');
const video18Controller = require('../controllers/video18');
const dsmhController = require('../controllers/dsmh');
 
// view
router.get('/portal', viewController.portal);

// login
router.post('/signup', userController.signup);
router.post('/login', userController.login);

// user page
router.get('/user', userController.allowIfLoggedin, userController.grantAccess('readOwn', 'videos'), userController.loadVideos);
router.get('/user/redownload', userController.allowIfLoggedin, userController.grantAccess('deleteOwn', 'videos'), userController.redownload);
router.get('/user/del', userController.allowIfLoggedin, userController.grantAccess('updateOwn', 'videos'), userController.deleteVideo);

// video18 page
router.get('/video18', userController.allowIfLoggedin, userController.grantAccess('readOwn', 'videos'), video18Controller.loadVideos);

// dsmh page
router.get('/dsmh', userController.allowIfLoggedin, userController.grantAccess('readOwn', 'videos'), dsmhController.loadComics);
router.get('/dsmh1/:index', userController.allowIfLoggedin, userController.grantAccess('readOwn', 'videos'), dsmhController.loadComicChaps);
router.get('/dsmh2/:index_chp', userController.allowIfLoggedin, userController.grantAccess('readOwn', 'videos'), dsmhController.loadComicContents);

// player
router.get('/player', userController.allowIfLoggedin, userController.grantAccess('readOwn', 'videos'), playerController.playVideo);
router.get('/player_check', userController.allowIfLoggedin, userController.grantAccess('readOwn', 'videos'), playerController.checkVideo);

// TODO: player ocr

module.exports = router