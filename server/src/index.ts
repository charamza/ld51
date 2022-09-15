import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.get(["/", "/:name"], (req, res) => {
  const greeting = "Hello From Node on Fly!!!";
  const name = req.params["name"];
  res.send(greeting + (name ? ` and hello to ${name}` : ""));
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));
