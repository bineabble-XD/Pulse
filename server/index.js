const express = require("express");
const app = express();

app.use(express.json()); // lets you read JSON bodies

// simple route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
