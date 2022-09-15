async function main() {
  const greetWho = import.meta.env.VITE_GREET;
  console.log(`Hello, ${greetWho} ;)`);
}

main();
