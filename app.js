const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const ObjectId = require("mongodb").ObjectID;

const app = express();
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);

// Load Environment Variables
require("dotenv").config();

/* 0. System Setup */

// Power up static serving
app.use(express.static('public'));

// Reusable database connection
var db;

console.log("Awaiting database connection...");

mongodb.MongoClient.connect(
	process.env.MONGODB_URI || "mongodb://localhost:27017/snaps",
	{
		useUnifiedTopology: true,
		useNewUrlParser: true
	},
	(err, client) => {
		if (err) {
			console.log(err);
			process.exit(1);
		}

		// Save database object from the callback for reuse.
		db = client.db();
		console.log("MongoDB connection ready!");

		// Initialize the app.
		var server = app.listen(process.env.PORT || 3000, () => {
			var port = server.address().port;
			console.log(`Pitaya is running on port ${port}.`);
		});
	}
);

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
	console.log("ERROR: " + reason);
	res.status(code || 500).json({ status: code || 500, message: message });
}