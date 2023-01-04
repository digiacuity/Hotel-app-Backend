const express = require("express");
const app = express();
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const URL = process.env.URL;
const PORT = process.env.PORT || 8009;
const cors = require("cors");
app.use(cors({}));
app.use(express.json());

function auth(req, res, next) {
  if (req.headers.authorization) {
    let decode = jwt.verify(req.headers.authorization, "secretkey");
    if (decode) {
      req.userId = decode.id;
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}

// Register

app.post("/register", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);
    let db = connection.db("sample");
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(req.body.password, salt);
    req.body.password = hash;
    await db.collection("users").insertOne(req.body);
    await connection.close();
    res.json({ messege: "User Added" });
  } catch (error) {
    res.status(500).json({ messege: "Register error" + error });
  }
});

// log in

app.post("/login", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);
    let db = connection.db("sample");
    let user = await db.collection("users").findOne({ email: req.body.email });
    if (user) {
      let compare = bcrypt.compareSync(req.body.password, user.password);
      if (compare) {
        let token = jwt.sign({ name: user.name, id: user._id }, "secretkey");
        res.json({ token });
      } else {
        res.status(500).json({ messege: "creditionals error" });
      }
    } else {
      res.status(500).json({ messege: "creditionals error" });
    }
    await connection.close();
  } catch (error) {
    res.status(500).json({ messege: "Login error" + error });
  }
});

// get user pofile info

app.get("/profile", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);
    let db = connection.db("sample");
    let datas = await db.collection("users").find().toArray();
    await connection.close();
    res.json(datas);
  } catch (error) {
    res.status(500).json({ messege: "profile info error" + error });
  }
});

// booking room

app.post("/booking", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);
    let db = connection.db("sample");
    await db.collection("booking").insertOne(req.body);
    await connection.close();
    res.json({ messege: "booked" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ messege: "Booking error" + error });
  }
});
app.post("/onlinebooking", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);
    let db = connection.db("sample");
    await db.collection("onlinebooking").insertOne(req.body);
    await connection.close();
    res.json({ messege: "online booked successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ messege: "online Booking error" + error });
  }
});
// get booking

app.get("/bookings", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);
    let db = connection.db("sample");
    let datas = await db.collection("booking").find().toArray();
    await connection.close();
    res.json(datas);
  } catch (error) {
    res.status(500).json({ messege: "Booking Get Error" + error });
  }
});
app.get("/onlinebookings", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);
    let db = connection.db("sample");
    let datas = await db.collection("onlinebooking").find().toArray();
    await connection.close();
    res.json(datas);
  } catch (error) {
    res.status(500).json({ messege: "Online Booking Get Error" + error });
  }
});

// get perticular booking

app.get("/booking/:id", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    let bookings = await db
      .collection("booking")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });

    await connection.close();

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ messege: "error" });
  }
});
app.get("/onlinebooking/:id", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    let bookings = await db
      .collection("onlinebooking")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });

    await connection.close();

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ messege: "error" });
  }
});
// update  booking

app.put("/bookingedit/:id", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    await db
      .collection("booking")
      .updateOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.body });

    await connection.close();

    res.json({ message: "booking details Updated" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.put("/onlinebookingedit/:id", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    await db
      .collection("onlinebooking")
      .updateOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.body });

    await connection.close();

    res.json({ message: "online booking details Updated" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});
// Delete bookings

app.delete("/booking/:id", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    await db
      .collection("booking")
      .deleteOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.body });

    await connection.close();

    res.json({ messege: "deleted" });
  } catch (error) {
    res.status(500).json({ messege: "error" });
  }
});

app.delete("/onlinebooking/:id", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    await db
      .collection("onlinebooking")
      .deleteOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.body });

    await connection.close();

    res.json({ messege: "deleted" });
  } catch (error) {
    res.status(500).json({ messege: "error" });
  }
});
// post reserve

app.post("/reserve", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    await db.collection("reserve").insertOne(req.body);

    await connection.close();

    res.json({ messege: "Reserved" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ messege: "Reserve error" + error });
  }
});

// get reserve

app.get("/reservelist", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    let datas = await db.collection("reserve").find().toArray();

    await connection.close();

    res.json(datas);
  } catch (error) {
    res.status(500).json({ messege: "Reserve Get error" + error });
  }
});

// get perticular reserve

app.get("/reserveview/:id", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    let bookings = await db
      .collection("reserve")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });

    await connection.close();

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ messege: "reseve view error" });
  }
});

// update  reserve

app.put("/reserveedit/:id", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    await db
      .collection("reserve")
      .updateOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.body });

    await connection.close();

    res.json({ message: "reserve details Updated" });
  } catch (error) {
    res.status(500).json({ message: "reserve details Updated went wrong" });
  }
});

// Delete reserve

app.delete("/reserve/:id", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    await db
      .collection("reserve")
      .deleteOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.body });

    await connection.close();

    res.json({ messege: "deleted" });
  } catch (error) {
    res.status(500).json({ messege: "error" });
  }
});

// post bill
app.post("/bill", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    await db.collection("bill").insertOne(req.body);

    await connection.close();

    res.json({ messege: "success" });
  } catch (error) {
    res.status(500).json({ messege: "error" });
  }
});
app.get("/roomsavailable", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    let availabledata = await db
      .collection("rooms")
      .find({ bookingstatus: "Available" })
      .toArray();

    await connection.close();

    res.status(200).json(availabledata);
  } catch (error) {
    res.status(500).json({ messege: "error" });
  }
});

app.get("/roomsfind", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    let datasear = await db.collection("rooms").find(req.query).toArray();

    // if (datasear) {
    //   datasear.bookingstatus = false;
    // }
    // await datasear.save();
    await connection.close();

    res.json(datasear);
  } catch (error) {
    res.status(500).json({ messege: "error" });
  }
});
app.get("/search", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");
    const { ...others } = req.query;
    let datasearch = await db
      .collection("booking")
      .find({ ...others })
      .toArray();

    await connection.close();

    res.json(datasearch);
  } catch (error) {
    res.status(500).json({ messege: "error" });
  }
});

// get bill

app.get("/bill", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    let datas = await db.collection("bill").find().toArray();

    await connection.close();

    res.json(datas);
  } catch (error) {
    res.status(500).json({ messege: "error" });
  }
});

// get perticular bill

app.get("/bill/:id", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    let bookings = await db
      .collection("bill")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });

    await connection.close();

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ messege: "error" });
  }
});

// update edit bill

app.put("/billedit/:id", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    await db
      .collection("bill")
      .updateOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.body });

    await connection.close();

    res.json({ message: "bill details Updated" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Delete bill

app.delete("/bill/:id", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    await db
      .collection("bill")
      .deleteOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.body });

    await connection.close();

    res.json({ messege: "deleted" });
  } catch (error) {
    res.status(500).json({ messege: "error" });
  }
});
// Added room

app.post("/room", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    await db.collection("rooms").insertOne(req.body);

    await connection.close();

    res.json({ messege: "Room Created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ messege: "error" });
  }
});

// get Room Details

app.get("/rooms", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    let datas = await db.collection("rooms").find().toArray();

    await connection.close();

    res.json(datas);
  } catch (error) {
    res.status(500).json({ messege: "error" });
  }
});

// get perticular rooms

app.get("/roomsview/:id", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    let bookings = await db
      .collection("rooms")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });

    await connection.close();

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ messege: "error" });
  }
});

// shift rooms

app.get("/roomshift/:roomnumber", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    let bookings = await db
      .collection("rooms")
      .findOne({ roomnumber: mongodb.req.params.roomnumber });

    await connection.close();

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ messege: "error" });
  }
});

// update edit room

app.put("/roomsedit/:id", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    await db
      .collection("rooms")
      .updateOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.body });

    await connection.close();

    res.json({ message: "rooms Updated" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Delete rooms

app.delete("/rooms/:id", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    await db
      .collection("rooms")
      .deleteOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.body });

    await connection.close();

    res.json({ messege: "deleted" });
  } catch (error) {
    res.status(500).json({ messege: "error" });
  }
});

// Added staff

app.post("/staff", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    await db.collection("staff").insertOne(req.body);

    await connection.close();

    res.json({ messege: "Employee Created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ messege: "error" });
  }
});

// get staff Details

app.get("/staff", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    let datas = await db.collection("staff").find().toArray();

    await connection.close();

    res.json(datas);
  } catch (error) {
    res.status(500).json({ messege: "error" });
  }
});

// get perticular staff

app.get("/staffview/:id", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    let staffs = await db
      .collection("staff")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });

    await connection.close();

    res.json(staffs);
  } catch (error) {
    res.status(500).json({ messege: "error" });
  }
});

// update  staff

app.put("/staffedit/:id", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    await db
      .collection("staff")
      .updateOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.body });

    await connection.close();

    res.json({ message: "staff details Updated" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Delete staff

app.delete("/staff/:id", auth, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("sample");

    await db
      .collection("staff")
      .deleteOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.body });

    await connection.close();

    res.json({ messege: "deleted" });
  } catch (error) {
    res.status(500).json({ messege: "error" });
  }
});

app.listen(PORT, () => {
  console.log(`server start ${PORT}`);
});
