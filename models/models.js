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
module.exports = { 
    'User': User, 
    'Video': Video,
};