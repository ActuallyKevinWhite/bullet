/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
const CONFIG = {
    DISPLAY_NAME: "display",
    DISPLAY_WIDTH: 640,
    DISPLAY_HEIGHT: 480,
}
console.log("Hello via Bun!");
interface Vector {
    x: number,
    y: number
}
const Display = {
    // Centered for the sake of the bullet hell
    draw_rectangle: function (x: number, y: number, w: number, h: number, color: string) {
        if (!Game.Context) { return false; }
        Game.Context.fillStyle = color;
        Game.Context.fillRect(x - w / 2, y - h / 2, w, h)
        return true;
    },
    draw_circle: function (x: number, y: number, r: number, color: string) {
        if (!Game.Context) { return false; }
        Game.Context.fillStyle = color;
        Game.Context.beginPath();
        Game.Context.arc(x, y, r, 0, 2 * Math.PI);
        Game.Context.fill();
        return true;
    },
    draw_line: function (start: Vector, end: Vector, color: string) {
        if (!Game.Context) { return false; }
        Game.Context.strokeStyle = color;
        Game.Context.beginPath();
        Game.Context.moveTo(start.x, start.y);
        Game.Context.lineTo(end.x, end.y);
        Game.Context.stroke();
        return true;
    }
}

const Game = {
    Canvas:  null as HTMLCanvasElement        | null,
    Context: null as CanvasRenderingContext2D | null,

    initialize: function () {
        Game.Canvas  = document.getElementById(CONFIG.DISPLAY_NAME) as HTMLCanvasElement;
        Game.Context = Game.Canvas.getContext("2d")                 as CanvasRenderingContext2D;

        Game.Canvas.width  = CONFIG.DISPLAY_WIDTH;
        Game.Canvas.height = CONFIG.DISPLAY_HEIGHT;

        Game.Context.fillStyle = "black";
        Game.Context.fillRect(0, 0, CONFIG.DISPLAY_WIDTH, CONFIG.DISPLAY_HEIGHT);
        Display.draw_rectangle(100, 100, 32, 32, 'red')
        Display.draw_circle(100, 100, 8, 'blue')
        Display.draw_line({ x: 100, y: 100 }, { x: 200, y: 200 }, 'green')
    }
}

document.addEventListener("DOMContentLoaded", () => {
    Game.initialize();
});