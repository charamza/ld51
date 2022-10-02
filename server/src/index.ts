import express from "express";
import { WebSocketServer } from "ws";
import cors from "cors";

(await import("dotenv-flow")).config();

const app = express();
const port = process.env.PORT || 3001;

const wsServer = new WebSocketServer({ noServer: true });
wsServer.on("connection", (socket) => {
  socket.on("message", (message) => socket.send(message));
});

app.use(cors());

app.get(["/", "/:name"], (req, res) => {
  const greeting = `Hello from ${process.env.VITE_BACKEND_SECURE === "true" ? "production" : "local"} node on Fly!!!`;
  const name = req.params["name"];
  res.send(greeting + (name ? ` and hello to ${name}` : ""));
});

const httpServer = app.listen(port, () => console.log(`Server listening on port ${port}!`));
httpServer.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit("connection", socket, request);
  });
});
