import express from "express";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ybzmsy1.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();
    const database = client.db("finalProjectAss12DB");
    const classCollection = database.collection("classes");
    const selectCourseCollection = database.collection("selectCourse");
    const userCollection = database.collection("users");

    // user relate api
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // instructor classes relate api
    app.get("/classes", async (req, res) => {
      const result = await classCollection.find().toArray();
      res.send(result);
    });

    app.post("/classes", async (req, res) => {
      const classDoc = req.body;
      const result = await classCollection.insertOne(classDoc);
      res.send(result);
    });

    // student select course relate api
    app.get("/selectCourse", async (req, res) => {
      const email = req.query?.email;
      const option = { projection: { classId: 1 } };
      const selectedClass = await selectCourseCollection
        .find({ email }, option)
        .toArray();
      const query = {
        _id: {
          $in: selectedClass?.map((item) => new ObjectId(item?.classId)),
        },
      };

      const result = await classCollection.find(query).toArray();
      res.send({ selectedClass, result });
    });

    app.post("/selectCourse", async (req, res) => {
      const course = req.body;
      const result = await selectCourseCollection.insertOne(course);
      res.send(result);
    });

    app.delete("/selectCourse/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await selectCourseCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
};
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
