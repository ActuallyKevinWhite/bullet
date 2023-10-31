/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
const CONFIG = {
    DISPLAY_NAME: "display",
    DISPLAY_WIDTH: 640,
    DISPLAY_HEIGHT: 480,
}
console.log("Hello via Bun!");

const Game = {
    Canvas:  null as HTMLCanvasElement        | null,
    Context: null as CanvasRenderingContext2D | null,

    initialize: function () {
        this.Canvas = document.getElementById(CONFIG.DISPLAY_NAME) as HTMLCanvasElement;
        this.Context = this.Canvas.getContext("2d") as CanvasRenderingContext2D;

        this.Canvas.width = CONFIG.DISPLAY_WIDTH;
        this.Canvas.height = CONFIG.DISPLAY_HEIGHT;

        this.Context.fillStyle = "black";
        this.Context.fillRect(0, 0, CONFIG.DISPLAY_WIDTH, CONFIG.DISPLAY_HEIGHT);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    Game.initialize();
});