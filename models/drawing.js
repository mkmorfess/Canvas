var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  color: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  points: {
  	type: Array,
  	required: true
  }
});

var strokes = mongoose.model("Strokes", UserSchema);

module.exports = strokes;