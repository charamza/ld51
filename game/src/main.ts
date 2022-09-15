async function main() {
  const greetWho = import.meta.env.VITE_GREET;
  console.log(`Hello, ${greetWho} ;)`);

  const secure = import.meta.env.VITE_BACKEND_SECURE === "true";
  const ws = new WebSocket(`${secure ? "wss" : "ws"}://${import.meta.env.VITE_BACKEND_HOST}`);
  ws.onmessage = async (event) => console.log("[RECV]", await event.data.text());
  ws.onopen = () => {
    console.log("Connected");
    ws.send("Hello from the browser!");
  };
}

main();
