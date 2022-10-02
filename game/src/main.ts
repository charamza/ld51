// async function main() {
//   const greetWho = import.meta.env.VITE_GREET;
//   console.log(`Hello, ${greetWho} ;)`);

import Game from "./game/game";
import Input from "./utils/input";

//   const secure = import.meta.env.VITE_BACKEND_SECURE === "true";
//   const ws = new WebSocket(`${secure ? "wss" : "ws"}://${import.meta.env.VITE_BACKEND_HOST}`);
//   ws.onmessage = async (event) => console.log("[RECV]", await event.data.text());
//   ws.onopen = () => {
//     console.log("Connected");
//     ws.send("Hello from the browser!");
//   };
// }

async function main() {
  Input.init();
  const game = new Game();
  game.init();

  document.getElementById("screens").style.display = "";
}

main();
