const express = require("express");
const app = express();
const path = require("path");

//Init Middle wares

app.use(express.json({ extended: false }));
//connect Database

require("./config/db")();

//Define Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/post", require("./routes/api/post"));

//Serve static assets in production

if (process.env.NODE_ENV === "production") {
  //set static folder

  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendfile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Started on port ${PORT}`);
});
