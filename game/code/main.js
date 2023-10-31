// index.ts
var CONFIG = {
  DISPLAY_NAME: "display",
  DISPLAY_WIDTH: 512,
  DISPLAY_HEIGHT: 320,
  DEBUG_INPUT: false,
  DEBUG_PERFORMANCE: false,
  DEBUG_RENDERER: true,
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
  },
  rotate: function(a, angle) {
    angle = angle * Math.PI / 180;
    return {
      x: a.x * Math.cos(angle) - a.y * Math.sin(angle),
      y: a.x * Math.sin(angle) + a.y * Math.cos(angle)
    };
  }
};
var Display = {
  Camera: { x: 0, y: 0 },
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
    Game.Context.fillRect(position.x - dimensions.x / 2 - Display.Camera.x, position.y - dimensions.y / 2 - Display.Camera.y, dimensions.x, dimensions.y);
    return true;
  },
  draw_circle: function(position, r, color) {
    if (!Game.Context) {
      return false;
    }
    Game.Context.fillStyle = color;
    Game.Context.beginPath();
    Game.Context.arc(position.x - Display.Camera.x, position.y - Display.Camera.y, r, 0, 2 * Math.PI);
    Game.Context.fill();
    return true;
  },
  draw_line: function(start, end, color) {
    if (!Game.Context) {
      return false;
    }
    Game.Context.strokeStyle = color;
    Game.Context.beginPath();
    Game.Context.moveTo(start.x - Display.Camera.x, start.y - Display.Camera.y);
    Game.Context.lineTo(end.x - Display.Camera.x, end.y - Display.Camera.y);
    Game.Context.stroke();
    return true;
  },
  draw_text: function(position, text) {
    if (!Game.Context) {
      return false;
    }
    Game.Context.fillStyle = "white";
    const size = 16;
    Game.Context.font = `${size}px Arial`;
    Game.Context.textAlign = "center";
    Game.Context.fillText(text, position.x - Display.Camera.x, position.y + size / 2 - Display.Camera.y);
  },
  update: function() {
    const player = Player.get(Game.Player);
    if (!player) {
      return false;
    }
    Display.Camera.x = player.Position.x - CONFIG.DISPLAY_WIDTH / 2;
    Display.Camera.y = player.Position.y - CONFIG.DISPLAY_HEIGHT / 2;
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
  },
  update: function() {
    const player = Player.get(Game.Player);
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
    player.Position.x = Math.max(player.Position.x, 0);
    player.Position.x = Math.min(player.Position.x, Arena.Settings.Dimensions.x);
    player.Position.y = Math.max(player.Position.y, 0);
    player.Position.y = Math.min(player.Position.y, Arena.Settings.Dimensions.y);
    Display.update();
    const mouse_to_camera = Vector.add(Input.Mouse, Display.Camera);
    if (Input.Mouse_Down) {
      Gun.fire(Game.Gun, Vector.add({ x: 0, y: 0 }, player.Position), Vector.normalize(Vector.subtract(mouse_to_camera, player.Position)));
    }
    Display.draw_rectangle(player.Position, player.Dimensions, "red");
  }
};
var Debug = {
  update: function() {
    const player = Player.get(Game.Player);
    if (!player) {
      return false;
    }
    const mouse_in_world = Vector.add(Input.Mouse, Display.Camera);
    Display.draw_rectangle(player.Position, { x: 32, y: 32 }, "red");
    Display.draw_circle(mouse_in_world, 4, "blue");
    Display.draw_line(player.Position, mouse_in_world, "white");
  }
};
var Monster = {
  uuid: 0,
  list: [],
  create: function(position, dimensions = { x: 32, y: 32 }, health = { x: 10, y: 10 }) {
    const monster = {
      Position: position,
      Dimensions: dimensions,
      uuid: Monster.uuid++,
      Health: health
    };
    Monster.list.push(monster);
    return monster.uuid;
  },
  get: function(uuid) {
    return Monster.list.find((monster) => monster.uuid === uuid);
  },
  update: function() {
    const player = Player.get(Game.Player);
    if (!player) {
      return false;
    }
    if (Game.time_frames % (CONFIG.FPS * 0.5) === 0) {
      const side = Math.floor(Math.random() * 4);
      let position = { x: 0, y: 0 };
      switch (side) {
        case 0:
          position = {
            x: player.Position.x - CONFIG.DISPLAY_WIDTH / 2 + Math.random() * CONFIG.DISPLAY_WIDTH,
            y: player.Position.y - CONFIG.DISPLAY_HEIGHT / 2 - Math.random() * 128
          };
          break;
        case 1:
          position = {
            x: player.Position.x + CONFIG.DISPLAY_WIDTH / 2 + Math.random() * 128,
            y: player.Position.y - CONFIG.DISPLAY_HEIGHT / 2 + Math.random() * CONFIG.DISPLAY_HEIGHT
          };
          break;
        case 2:
          position = {
            x: player.Position.x - CONFIG.DISPLAY_WIDTH / 2 + Math.random() * CONFIG.DISPLAY_WIDTH,
            y: player.Position.y + CONFIG.DISPLAY_HEIGHT / 2 + Math.random() * 128
          };
          break;
        case 3:
          position = {
            x: player.Position.x - CONFIG.DISPLAY_WIDTH / 2 - Math.random() * 128,
            y: player.Position.y - CONFIG.DISPLAY_HEIGHT / 2 + Math.random() * CONFIG.DISPLAY_HEIGHT
          };
          break;
      }
      Monster.create(position);
    }
    for (let m = 0;m < Monster.list.length; m++) {
      const monster = Monster.list[m];
      if (monster.Health.x <= 0) {
        Monster.list.splice(m, 1);
        m--;
        continue;
      }
      const direction = Vector.normalize(Vector.subtract(player.Position, monster.Position));
      monster.Position.x += direction.x;
      monster.Position.y += direction.y;
      Display.draw_rectangle(monster.Position, monster.Dimensions, "blue");
    }
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
      for (let m = 0;m < Monster.list.length; m++) {
        const monster = Monster.list[m];
        if (Math.abs(projectile.Position.x - monster.Position.x) < monster.Dimensions.x / 2) {
          if (Math.abs(projectile.Position.y - monster.Position.y) < monster.Dimensions.y / 2) {
            monster.Health.x -= projectile.damage;
            Projectile.good_list.splice(g, 1);
            g--;
            break;
          }
        }
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
var Gun = {
  list: [],
  create: function(accuracy_degrees = 0, damage = 1, bullet_speed = 5, projectiles = 1, fire_rate = 1, magazine = 1, reload_time = 1, good = true) {
    const gun = {
      accuracy: accuracy_degrees,
      damage,
      bullet_speed,
      bullet_range: 1000,
      bullet_size: 4,
      projectiles,
      fire_rate: { x: 0, y: fire_rate },
      magazine: { x: magazine, y: magazine },
      reload_time: { x: reload_time, y: reload_time },
      good,
      uuid: Gun.list.length
    };
    Gun.list.push(gun);
    return gun.uuid;
  },
  update: function() {
    for (let g = 0;g < Gun.list.length; g++) {
      const gun = Gun.list[g];
      if (gun.reload_time.x < gun.reload_time.y) {
        gun.reload_time.x++;
        if (gun.reload_time.x >= gun.reload_time.y) {
          gun.magazine.x = gun.magazine.y;
        }
      }
      if (gun.fire_rate.x < gun.fire_rate.y) {
        gun.fire_rate.x++;
      }
      if (gun.magazine.x < 1 && gun.reload_time.x >= gun.reload_time.y) {
        gun.reload_time.x = 0;
      }
    }
  },
  get: function(uuid) {
    return Gun.list.find((gun) => gun.uuid === uuid);
  },
  fire: function(gun, position, direction) {
    const gun_data = Gun.get(gun);
    if (!gun_data) {
      return false;
    }
    if (gun_data.magazine.x < 1) {
      return false;
    }
    if (gun_data.fire_rate.x < gun_data.fire_rate.y) {
      return false;
    }
    gun_data.magazine.x--;
    gun_data.fire_rate.x = 0;
    for (let p = 0;p < gun_data.projectiles; p++) {
      Projectile.create(position, Vector.rotate(Vector.scale(direction, gun_data.bullet_speed), (Math.random() - 0.5) * gun_data.accuracy), gun_data.damage, gun_data.bullet_size, gun_data.bullet_range / gun_data.bullet_speed, gun_data.good);
    }
  }
};
var Arena = {
  Settings: {
    Dimensions: { x: 200, y: 200 }
  },
  update: function() {
    Display.draw_rectangle({ x: Arena.Settings.Dimensions.x / 2, y: Arena.Settings.Dimensions.y / 2 }, Arena.Settings.Dimensions, "purple");
  }
};
var Game = {
  Canvas: null,
  Context: null,
  Loop: null,
  time_frames: 0,
  time_ms: 0,
  Player: -1,
  Gun: -1,
  initialize: function() {
    Game.Canvas = document.getElementById(CONFIG.DISPLAY_NAME);
    Game.Context = Game.Canvas.getContext("2d");
    Game.Canvas.width = CONFIG.DISPLAY_WIDTH;
    Game.Canvas.height = CONFIG.DISPLAY_HEIGHT;
    Game.Context.fillStyle = "black";
    Game.Context.fillRect(0, 0, CONFIG.DISPLAY_WIDTH, CONFIG.DISPLAY_HEIGHT);
    Input.initialize();
    Game.Player = Player.create({ x: CONFIG.DISPLAY_WIDTH / 2, y: CONFIG.DISPLAY_HEIGHT / 2 });
    Game.Gun = Gun.create();
    Game.Loop = setInterval(Game.update, 1000 / CONFIG.FPS);
  },
  update: function() {
    const player = Player.get(0);
    if (!player) {
      return false;
    }
    Display.clear();
    Arena.update();
    Gun.update();
    Player.update();
    Monster.update();
    Projectile.update();
    if (CONFIG.DEBUG_RENDERER) {
      Debug.update();
    }
    if (CONFIG.DEBUG_PERFORMANCE) {
      const new_time_ms = performance.now();
      const delta_time_ms = new_time_ms - Game.time_ms;
      Display.draw_text(player.Position, `FPS: ${Math.round(1000 / delta_time_ms)}`);
      Game.time_ms = new_time_ms;
    }
    Game.time_frames++;
  }
};
document.addEventListener("DOMContentLoaded", () => {
  Game.initialize();
});
