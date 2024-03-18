import model from "./model";

const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://aeonstechdevops:aeonstechdevops@cluster0.3wqhluk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("Connected to DB"))
  .catch((err: any) => console.error(err));

app.get("/", async (req: any, res: any) => {
  console.log(await model.create({ name: "Server " + Date.now() }));
  return res.send("Hello I am Server!");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
