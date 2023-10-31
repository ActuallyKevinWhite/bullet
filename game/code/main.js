// index.ts
var CONFIG = {
  DISPLAY_NAME: "display",
  DISPLAY_WIDTH: 640,
  DISPLAY_HEIGHT: 480
};
console.log("Hello via Bun!");
var Display = {
  draw_rectangle: function(x, y, w, h, color) {
    if (!Game.Context) {
      return false;
    }
    Game.Context.fillStyle = color;
    Game.Context.fillRect(x - w / 2, y - h / 2, w, h);
    return true;
  },
  draw_circle: function(x, y, r, color) {
    if (!Game.Context) {
      return false;
    }
    Game.Context.fillStyle = color;
    Game.Context.beginPath();
    Game.Context.arc(x, y, r, 0, 2 * Math.PI);
    Game.Context.fill();
    return true;
  },
  draw_line: function(start, end, color) {
    if (!Game.Context) {
      return false;
    }
    Game.Context.strokeStyle = color;
    Game.Context.beginPath();
    Game.Context.moveTo(start.x, start.y);
    Game.Context.lineTo(end.x, end.y);
    Game.Context.stroke();
    return true;
  }
};
var Game = {
  Canvas: null,
  Context: null,
  initialize: function() {
    Game.Canvas = document.getElementById(CONFIG.DISPLAY_NAME);
    Game.Context = Game.Canvas.getContext("2d");
    Game.Canvas.width = CONFIG.DISPLAY_WIDTH;
    Game.Canvas.height = CONFIG.DISPLAY_HEIGHT;
    Game.Context.fillStyle = "black";
    Game.Context.fillRect(0, 0, CONFIG.DISPLAY_WIDTH, CONFIG.DISPLAY_HEIGHT);
    Display.draw_rectangle(100, 100, 32, 32, "red");
    Display.draw_circle(100, 100, 8, "blue");
    Display.draw_line({ x: 100, y: 100 }, { x: 200, y: 200 }, "green");
  }
};
document.addEventListener("DOMContentLoaded", () => {
  Game.initialize();
});
