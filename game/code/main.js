// index.ts
var CONFIG = {
  DISPLAY_NAME: "display",
  DISPLAY_WIDTH: 640,
  DISPLAY_HEIGHT: 480,
  DEBUG_INPUT: true,
  FPS: 60
};
var Display = {
  clear: function(color = "black") {
    if (!Game.Context) {
      return false;
    }
    Game.Context.fillStyle = color;
    Game.Context.fillRect(0, 0, CONFIG.DISPLAY_WIDTH, CONFIG.DISPLAY_HEIGHT);
    return true;
  },
  draw_rectangle: function(position, dimensions, color) {
    if (!Game.Context) {
      return false;
    }
    Game.Context.fillStyle = color;
    Game.Context.fillRect(position.x - dimensions.x / 2, position.y - dimensions.y / 2, dimensions.x, dimensions.y);
    return true;
  },
  draw_circle: function(position, r, color) {
    if (!Game.Context) {
      return false;
    }
    Game.Context.fillStyle = color;
    Game.Context.beginPath();
    Game.Context.arc(position.x, position.y, r, 0, 2 * Math.PI);
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
var Input = {
  Mouse: { x: 0, y: 0 },
  Mouse_Down: false,
  Keys: {},
  initialize: function() {
    document.addEventListener("keydown", function(event) {
      if (CONFIG.DEBUG_INPUT) {
        console.log(event.code);
      }
      Input.Keys[event.code] = true;
    });
    document.addEventListener("keyup", function(event) {
      if (CONFIG.DEBUG_INPUT) {
        console.log(event.code);
      }
      Input.Keys[event.code] = false;
    });
    document.addEventListener("mousemove", function(event) {
      const rect = Game.Canvas?.getBoundingClientRect();
      if (rect) {
        Input.Mouse.x = event.clientX - rect.left;
        Input.Mouse.y = event.clientY - rect.top;
      }
    });
    document.addEventListener("mousedown", function(event) {
      Input.Mouse_Down = true;
    });
    document.addEventListener("mouseup", function(event) {
      Input.Mouse_Down = false;
    });
  }
};
var Player = {
  uuid: 0,
  list: [],
  create: function(position) {
    const player = {
      Position: position,
      uuid: Player.uuid++
    };
    Player.list.push(player);
    return player.uuid;
  },
  get: function(uuid) {
    return Player.list.find((player) => player.uuid === uuid);
  }
};
var Game = {
  Canvas: null,
  Context: null,
  Loop: null,
  initialize: function() {
    Game.Canvas = document.getElementById(CONFIG.DISPLAY_NAME);
    Game.Context = Game.Canvas.getContext("2d");
    Game.Canvas.width = CONFIG.DISPLAY_WIDTH;
    Game.Canvas.height = CONFIG.DISPLAY_HEIGHT;
    Game.Context.fillStyle = "black";
    Game.Context.fillRect(0, 0, CONFIG.DISPLAY_WIDTH, CONFIG.DISPLAY_HEIGHT);
    Input.initialize();
    Player.create({ x: CONFIG.DISPLAY_WIDTH / 2, y: CONFIG.DISPLAY_HEIGHT / 2 });
    Game.Loop = setInterval(Game.update, 1000 / CONFIG.FPS);
  },
  update: function() {
    const player = Player.get(0);
    if (!player) {
      return false;
    }
    if (Input.Keys["KeyW"]) {
      player.Position.y -= 5;
    }
    if (Input.Keys["KeyA"]) {
      player.Position.x -= 5;
    }
    if (Input.Keys["KeyS"]) {
      player.Position.y += 5;
    }
    if (Input.Keys["KeyD"]) {
      player.Position.x += 5;
    }
    Display.clear();
    Display.draw_rectangle(player.Position, { x: 32, y: 32 }, "red");
    Display.draw_circle(Input.Mouse, 4, "blue");
    Display.draw_line(player.Position, Input.Mouse, "white");
  }
};
document.addEventListener("DOMContentLoaded", () => {
  Game.initialize();
});
