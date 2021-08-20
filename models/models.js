const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const VideoSchema = new Schema({
 token: {
  type: String,
  trim: true
 },
 url: {
  type: String,
  required: true
 },
 website: {
  type: String,
 },
 completed: {
  type: Boolean,
  default: false
 }
});

const UserSchema = new Schema({
	email: {
	 type: String,
	 required: true,
	 trim: true
	},
	password: {
	 type: String,
	 required: true
	},
	role: {
	 type: String,
	 default: 'basic',
	 enum: ["basic", "supervisor", "admin"]
	},
	accessToken: {
	 type: String
	},
	videoList: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'video'
	}],
});

const User = mongoose.model('user', UserSchema);
const Video = mongoose.model('video', VideoSchema);



// 18

const Video18Schema = new Schema({
 index: {
  type: String,
 },
 url: {
  type: String,
 },
 title: {
  type: String,
 },
 tags: [{
  type: String,
 }],
 cover: {
  type: String,
 },
 imgs: [{
  type: String,
 }],
 player: {
  type: String,
 },
});

const Video18 = mongoose.model('video18', Video18Schema);

module.exports = { 
    'User': User, 
    'Video': Video,
    'Video18': Video18,
};