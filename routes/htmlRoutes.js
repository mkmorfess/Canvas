var express = require("express")
var router = express.Router();

var mongoose = require("mongoose");

var databaseUrl = process.env.MONGODB_URI ||'mongodb://localhost:27017/drawings';
var collections = ["strokes"];

mongoose.Promise = Promise;
mongoose.connect(databaseUrl);

var db = require("./../models/drawing.js")

db.on("error", function(error) {
  console.log("Database Error:", error);
});

router.get("/", function(req, res) {
	res.render("index")
})

router.post("/", function(req, res){
	
	db.create({
		color: req.body.color,
		size: req.body.size,
		type: req.body.type,
		points: req.body.points
	}, function(err, data){

		if (err) {
      		console.log("This is the error: " + err);
      		res.json({"Error": "Error"});
    	}
    	else {
    		console.log(data)
      		res.json(data);
    	}

	})
})

router.put("/", function(req, res){
	db.find({}, function(err,data){

		if (err) {
      		console.log("This is the error: " + err);
      		res.json({"Error": "Error"});
    	}
    	else {
    		console.log(data)
      		res.json(data);
    	}

	})
})

router.delete("/delete", function(req, res){
	db.find({}).remove({}, function(err, data){

		if (err) {
      		console.log("This is the error: " + err);
      		res.json({"Error": "Error"});
    	}
    	else {
    		console.log(data)
      		res.json(data);
    	}

	})
})

router.delete("/undo", function(req, res){
	db.find({}).sort({'_id': -1}).exec(function(err, data){

		if (err) {
      		console.log("This is the error: " + err);
      		res.json({"Error": "Error"});
    	}
    	else {
    		console.log(data[0]._id)

      		db.findByIdAndRemove(data[0]._id, function(error, removed){

      			if (err) {
		      		console.log("This is the error: " + err);
		      		res.json({"Error": "Error"});
		    	}
    			else {
    				console.log(removed)
    				res.json(removed)

    			}

      		})
    	}

	})
})

module.exports = router;