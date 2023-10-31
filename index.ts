/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
const CONFIG = {
    DISPLAY_NAME: "display",
    DISPLAY_WIDTH: 640,
    DISPLAY_HEIGHT: 480,

    FPS: 60,
}
console.log("Hello via Bun!");
interface Vector {
    x: number,
    y: number
}
const Display = {
    clear: function (color: string = "black") {
        if (!Game.Context) { return false; }
        Game.Context.fillStyle = color;
        Game.Context.fillRect(0, 0, CONFIG.DISPLAY_WIDTH, CONFIG.DISPLAY_HEIGHT);
        return true;
    },
    // Centered for the sake of the bullet hell
    draw_rectangle: function (position: Vector, dimensions: Vector, color: string) {
        if (!Game.Context) { return false; }
        Game.Context.fillStyle = color;
        Game.Context.fillRect(position.x - dimensions.x / 2, position.y - dimensions.y / 2, dimensions.x, dimensions.y);
        return true;
    },
    draw_circle: function (position: Vector, r: number, color: string) {
        if (!Game.Context) { return false; }
        Game.Context.fillStyle = color;
        Game.Context.beginPath();
        Game.Context.arc(position.x, position.y, r, 0, 2 * Math.PI);
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
interface Player {
    Position: Vector,
    uuid: number
}
const Player = {
    uuid: 0,
    list: [] as Player[],
    create: function (position: Vector) {
        const player = {
            Position: position,
            uuid: Player.uuid++,
        }
        Player.list.push(player);
        return player.uuid;
    },
    get: function (uuid: number) {
        return Player.list.find(player => player.uuid === uuid);
    }
}

const Game = {
    Canvas:  null as HTMLCanvasElement        | null,
    Context: null as CanvasRenderingContext2D | null,

    Loop: null as Timer | null,

    initialize: function () {
        Game.Canvas  = document.getElementById(CONFIG.DISPLAY_NAME) as HTMLCanvasElement;
        Game.Context = Game.Canvas.getContext("2d")                 as CanvasRenderingContext2D;

        Game.Canvas.width  = CONFIG.DISPLAY_WIDTH;
        Game.Canvas.height = CONFIG.DISPLAY_HEIGHT;

        Game.Context.fillStyle = "black";
        Game.Context.fillRect(0, 0, CONFIG.DISPLAY_WIDTH, CONFIG.DISPLAY_HEIGHT);

        Player.create({ x: CONFIG.DISPLAY_WIDTH / 2, y: CONFIG.DISPLAY_HEIGHT / 2 });

        Game.Loop = setInterval(Game.update, 1000 / CONFIG.FPS);
    },
    update: function () {
        // Clear the screen
        Display.clear();
        // Draw player
        const player = Player.get(0);
        if (player) {
            Display.draw_rectangle(player.Position, { x: 32, y: 32 }, 'red')
        }
        // Draw the mouse position later
    }
}



document.addEventListener("DOMContentLoaded", () => {
    Game.initialize();
});