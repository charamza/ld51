import { Vec2 } from "./vectors";

type AllowedKeys =
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "Space"
  | "Enter"
  | "Escape"
  | "KeyW"
  | "KeyA"
  | "KeyS"
  | "KeyD"
  | "KeyQ"
  | "KeyE"
  | "KeyR"
  | "KeyF"
  | "KeyG"
  | "KeyH"
  | "KeyJ"
  | "KeyK"
  | "KeyL"
  | "KeyZ"
  | "KeyX"
  | "KeyC"
  | "KeyV"
  | "KeyB"
  | "KeyN"
  | "KeyM"
  | "KeyP"
  | "KeyO"
  | "KeyI"
  | "KeyU"
  | "KeyY"
  | "KeyT"
  | "Key1"
  | "Key2"
  | "Key3"
  | "Key4"
  | "Key5"
  | "Key6"
  | "Key7"
  | "Key8"
  | "Key9"
  | "Key0"
  | "Digit1"
  | "Digit2"
  | "Digit3"
  | "Digit4"
  | "Digit5"
  | "Digit6"
  | "Digit7"
  | "Digit8"
  | "Digit9"
  | "Digit0"
  | "Minus"
  | "Equal"
  | "Backspace"
  | "Tab"
  | "BracketLeft"
  | "BracketRight"
  | "Backslash"
  | "Semicolon"
  | "Quote"
  | "Comma"
  | "Period"
  | "Slash"
  | "CapsLock"
  | "ShiftLeft"
  | "ShiftRight"
  | "ControlLeft"
  | "ControlRight"
  | "AltLeft"
  | "AltRight"
  | "MetaLeft"
  | "MetaRight"
  | "ContextMenu"
  | "Insert"
  | "Delete"
  | "Home"
  | "End"
  | "PageUp"
  | "PageDown"
  | "NumLock"
  | "NumpadDivide"
  | "NumpadMultiply"
  | "NumpadSubtract"
  | "NumpadAdd"
  | "NumpadEnter"
  | "NumpadDecimal"
  | "Numpad1"
  | "Numpad2"
  | "Numpad3"
  | "Numpad4"
  | "Numpad5"
  | "Numpad6"
  | "Numpad7"
  | "Numpad8"
  | "Numpad9";

export enum MouseKey {
  Left = 0,
  Middle = 1,
  Right = 2,
}

export default class Input {
  private static keys: { [key: string]: boolean } = {};
  private static mouse: Vec2 = [0, 0];
  private static mouseKeys: [boolean, boolean, boolean] = [false, false, false];
  private static isInitialized: boolean = false;

  public static init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    window.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });

    window.addEventListener("mousemove", (e) => {
      this.mouse = [e.clientX, e.clientY];
    });

    window.addEventListener("mousedown", (e) => {
      if (e.button >= this.mouseKeys.length) return;
      this.mouseKeys[e.button] = true;
    });

    window.addEventListener("mouseup", (e) => {
      if (e.button >= this.mouseKeys.length) return;
      this.mouseKeys[e.button] = false;
    });
  }

  public static isKeyDown(key: AllowedKeys): boolean {
    return this.keys[key] || false;
  }

  public static isMouseKeyDown(button: MouseKey): boolean {
    return this.mouseKeys[button] || false;
  }

  public static getMousePos(): Vec2 {
    return this.mouse;
  }
}
