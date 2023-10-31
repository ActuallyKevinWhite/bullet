// index.ts
var CONFIG = {
  DISPLAY_NAME: "display",
  DISPLAY_WIDTH: 512,
  DISPLAY_HEIGHT: 320,
  DEBUG_INPUT: false,
  FPS: 60
};
var Vector = {
  add: function(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
  },
  subtract: function(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
  },
  multiply: function(a, b) {
    return { x: a.x * b.x, y: a.y * b.y };
  },
  divide: function(a, b) {
    return { x: a.x / b.x, y: a.y / b.y };
  },
  magnitude: function(a) {
    return Math.sqrt(a.x * a.x + a.y * a.y);
  },
  normalize: function(a) {
    const magnitude = Vector.magnitude(a);
    return { x: a.x / magnitude, y: a.y / magnitude };
  },
  scale: function(a, scalar) {
    return { x: a.x * scalar, y: a.y * scalar };
  }
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
  create: function(position, dimensions = { x: 32, y: 32 }, health = { x: 3, y: 3 }) {
    const player = {
      Position: position,
      Dimensions: dimensions,
      uuid: Player.uuid++,
      Health: health
    };
    Player.list.push(player);
    return player.uuid;
  },
  get: function(uuid) {
    return Player.list.find((player) => player.uuid === uuid);
  }
};
var Projectile = {
  good_list: [],
  evil_list: [],
  create: function(position, velocity, damage, size, duration, good) {
    const projectile = {
      Position: position,
      Velocity: velocity,
      damage,
      Timer: { x: 0, y: duration },
      Dimensions: { x: size, y: size }
    };
    if (good) {
      Projectile.good_list.push(projectile);
    } else {
      Projectile.evil_list.push(projectile);
    }
    return true;
  },
  update: function() {
    for (let g = 0;g < Projectile.good_list.length; g++) {
      const projectile = Projectile.good_list[g];
      projectile.Position.x += projectile.Velocity.x;
      projectile.Position.y += projectile.Velocity.y;
      projectile.Timer.x++;
      if (projectile.Timer.x >= projectile.Timer.y) {
        Projectile.good_list.splice(g, 1);
        g--;
        continue;
      }
      Display.draw_circle(projectile.Position, projectile.Dimensions.x, "green");
    }
    for (let e = 0;e < Projectile.evil_list.length; e++) {
      const projectile = Projectile.evil_list[e];
      projectile.Position.x += projectile.Velocity.x;
      projectile.Position.y += projectile.Velocity.y;
      projectile.Timer.x++;
      if (projectile.Timer.x >= projectile.Timer.y) {
        Projectile.evil_list.splice(e, 1);
        e--;
        continue;
      }
      for (let p = 0;p < Player.list.length; p++) {
        const player = Player.list[p];
        if (Math.abs(projectile.Position.x - player.Position.x) < player.Dimensions.x / 2) {
          if (Math.abs(projectile.Position.y - player.Position.y) < player.Dimensions.y / 2) {
            player.Health.x -= 1;
            Projectile.evil_list.splice(e, 1);
            e--;
            break;
          }
        }
      }
    }
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
    Display.clear();
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
    if (Input.Mouse_Down) {
      const direction = Vector.normalize(Vector.subtract(Input.Mouse, player.Position));
      Projectile.create(Vector.add(player.Position, Vector.scale(direction, 32)), Vector.scale(direction, 10), 10, 10, 60, true);
    }
    Projectile.update();
    Display.draw_rectangle(player.Position, { x: 32, y: 32 }, "red");
    Display.draw_circle(Input.Mouse, 4, "blue");
    Display.draw_line(player.Position, Input.Mouse, "white");
  }
};
document.addEventListener("DOMContentLoaded", () => {
  Game.initialize();
});
