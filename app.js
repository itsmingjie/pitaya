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

var router = express.Router();
app.use("/api", router);

// Load Environment Variables
require("dotenv").config();

/* 0. System Setup */

// Power up static serving
app.use(express.static("public"));

// Reusable database connection
var db, inventory;

console.log("Awaiting database connection...");

mongodb.MongoClient.connect(
	process.env.MONGODB_URI || "mongodb://localhost:27017/pitaya",
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

		// Declare collection
		inventory = db.collection("inventory");

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

/* 1. Static Routes */

/**
 * Uptime test
 */
router.get("/ping", (_, res) => {
	res.status(200).send("Pong!");
});

/* 2. Operational Routes */

router.post("/update", (req, res) => {
	var id;
	const count = parseInt(req.body.count); // negative to remove

	if (!req.body.id) {
		return handleError(res, "Invalid Input", "Missing ID.", 400);
	} else if (count == 0) {
		return handleError(
			res,
			"Invalid Input",
			"Cannot update item with 0.",
			400
		);
	}

	try {
		id = new ObjectId(req.body.id);
	} catch (err) {
		return handleError(res, "Invalid Input", "Invalid ID.", 400);
	}

	inventory.updateOne(
		{
			_id: id
		},
		{
			$inc: {
				count: count
			}
		},
		{ upsert: true },
		(err, doc) => {
			if (err) {
				return handleError(res, "DB Error", err.message, 400);
			} else {
				res.send(doc);
			}
		}
	);
});

router.post("/create", (req, res) => {
	var newItem = req.body;

	// sanitize data
	// because there's the coronavirus
	if (!newItem.name) {
		return handleError(res, "Invalid Input", "Missing name of item.", 400);
	} else if (!newItem.count) {
		newItem.count = 0;
	} else {
		newItem.count = parseInt(newItem.count);
	}

	inventory.insertOne(newItem, (err, doc) => {
		if (err) {
			return handleError(res, "DB Error", err.message, 400);
		} else {
			res.send(doc.ops[0]["_id"]);
		}
	});
});

router.post("/delete", (req, res) => {
  var id;

	if (!req.body.id) {
		return handleError(res, "Invalid Input", "Missing ID.", 400);
	}

	try {
		id = new ObjectId(req.body.id);
	} catch (err) {
		return handleError(res, "Invalid Input", "Invalid ID.", 400);
	}

	inventory.remove(
		{
			_id: id
		},
		(err, doc) => {
			if (err) {
				return handleError(res, "DB Error", err.message, 400);
			} else {
				res.sendStatus(200);
			}
		}
	);
})

router.get("/list", (_, res) => {
  inventory.find().toArray((err, doc) => {
    res.send(doc);
  })
})