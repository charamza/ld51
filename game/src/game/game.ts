import { FONT_NAME } from "../utils/consts";
import Camera from "./camera";
import GUI from "./gui";
import Score from "./score";
import World from "./world";

export default class Game {
  public canvasWidth = window.innerWidth;
  public canvasHeight = window.innerHeight;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public world: World;
  public camera: Camera;
  public gui: GUI;
  public score: Score;

  public playing: boolean = false;
  public paused: boolean = false;

  constructor() {
    this.canvas = document.getElementById("game") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    this.onWindowResize();
    window.addEventListener("resize", () => this.onWindowResize());

    this.world = new World(this);
    this.world.create();

    this.camera = new Camera(this);
    this.camera.update(0);
    this.gui = new GUI(this);
    this.score = new Score();
  }

  private onWindowResize(): void {
    this.canvasWidth = this.canvas.width = window.innerWidth;
    this.canvasHeight = this.canvas.height = window.innerHeight;
  }

  public init(): void {
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
    if (!this.paused) {
      this.world.update(dt);
      this.camera.update(dt);
    }
  }

  public render(): void {
    this.ctx.font = `20px ${FONT_NAME}`;
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.camera.translateContext(this.ctx);
    this.world.render(this.ctx);
    this.ctx.restore();

    this.gui.render(this.ctx);
  }

  public start(): void {
    const player = this.world.createPlayer();
    this.camera.focusObject(player);
    this.paused = false;
    this.playing = true;
    this.score.reset();
  }

  public restart(): void {
    this.world.create();
    const player = this.world.createPlayer();
    this.camera.focusObject(player);
    this.playing = true;
    this.score.reset();
  }

  public gameOver(): void {
    this.playing = false;
    this.camera.focusObject(null);
    this.camera.setZoomOut(3);
    this.gui.showGameOverScreen();
  }
}
