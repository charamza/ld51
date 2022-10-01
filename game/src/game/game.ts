import Camera from "./camera";
import GUI from "./gui";
import World from "./world";

export default class Game {
  public canvasWidth = window.innerWidth;
  public canvasHeight = window.innerHeight;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public world: World;
  public camera: Camera;
  public gui: GUI;

  constructor() {
    this.canvas = document.getElementById("game") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    this.onWindowResize();
    window.addEventListener("resize", () => this.onWindowResize());

    this.world = new World(this);
    const player = this.world.create();

    this.camera = new Camera(this);
    this.camera.focusObject(player);

    this.gui = new GUI(this);
  }

  private onWindowResize(): void {
    this.canvasWidth = this.canvas.width = window.innerWidth;
    this.canvasHeight = this.canvas.height = window.innerHeight;
  }

  public start(): void {
    let lastTime = Date.now();
    let lastSecond = Math.floor(Date.now() / 1000);
    let afps = 0;
    const loop = () => {
      const dt = (Date.now() - lastTime) / 1000;
      lastTime = Date.now();

      const second = Math.floor(Date.now() / 1000);
      afps++;
      if (second !== lastSecond) {
        console.log("FPS", afps);
        afps = 0;
        lastSecond = second;
      }

      this.update(dt);
      this.render();

      requestAnimationFrame(loop);
    };

    loop();
  }

  public update(dt: number): void {
    this.world.update(dt);
    this.camera.update(dt);
  }

  public render(): void {
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.camera.translateContext(this.ctx);
    this.world.render(this.ctx);
    this.ctx.restore();
  }

  public restart(): void {
    const player = this.world.create();
    this.camera.focusObject(player);
  }
}
