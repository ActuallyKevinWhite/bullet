// index.ts
var CONFIG = {
  DISPLAY_NAME: "display",
  DISPLAY_WIDTH: 640,
  DISPLAY_HEIGHT: 480
};
console.log("Hello via Bun!");
var Game = {
  Canvas: null,
  Context: null,
  initialize: function() {
    this.Canvas = document.getElementById(CONFIG.DISPLAY_NAME);
    this.Context = this.Canvas.getContext("2d");
    this.Canvas.width = CONFIG.DISPLAY_WIDTH;
    this.Canvas.height = CONFIG.DISPLAY_HEIGHT;
    this.Context.fillStyle = "black";
    this.Context.fillRect(0, 0, CONFIG.DISPLAY_WIDTH, CONFIG.DISPLAY_HEIGHT);
  }
};
document.addEventListener("DOMContentLoaded", () => {
  Game.initialize();
});
