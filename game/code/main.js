// index.ts
var Palette = {
  white: "#ecece0",
  light: "#ecc197",
  accent: "#d47563",
  dark: "#5c6181",
  black: "#3b3149"
};
var CONFIG = {
  DISPLAY_NAME: "display",
  DISPLAY_WIDTH: 640,
  DISPLAY_HEIGHT: 360,
  COLOR_VOID: Palette.black,
  COLOR_ARENA: Palette.dark,
  COLOR_PLAYER: Palette.white,
  COLOR_MONSTER: Palette.light,
  COLOR_ORB: Palette.light,
  COLOR_PROJECTILE_GOOD: Palette.white,
  COLOR_PROJECTILE_BAD: Palette.white,
  DEBUG_INPUT: false,
  DEBUG_PERFORMANCE: false,
  DEBUG_RENDERER: false,
  CHARACTER_SPRITE_SIZE: 32,
  GUN_SPRITE_SIZE: 32,
  DEBUG_GUN: true,
  PERFORMANCE_ENTITY_LIMTER: false,
  PROJECTILE_LIMIT_GOOD: 5000,
  PROJECTILE_LIMIT_EVIL: 15000,
  GUN_FIRE_POOL: 20,
  GUN_RELOAD_POOL: 5,
  CAMERA_FOV: 0.5,
  CAMERA_EASE: 0.95,
  MONSTER_LIMIT: 1000,
  FPS: 60
};
var ANIMATION;
(function(ANIMATION2) {
  ANIMATION2[ANIMATION2["IDLE"] = 0] = "IDLE";
  ANIMATION2[ANIMATION2["MOVE"] = 1] = "MOVE";
  ANIMATION2[ANIMATION2["FIRE"] = 2] = "FIRE";
  ANIMATION2[ANIMATION2["RELOAD"] = 3] = "RELOAD";
})(ANIMATION || (ANIMATION = {}));
var DIRECTION;
(function(DIRECTION2) {
  DIRECTION2[DIRECTION2["UP"] = 0] = "UP";
  DIRECTION2[DIRECTION2["RIGHT"] = 1] = "RIGHT";
  DIRECTION2[DIRECTION2["DOWN"] = 2] = "DOWN";
  DIRECTION2[DIRECTION2["LEFT"] = 3] = "LEFT";
})(DIRECTION || (DIRECTION = {}));
var Sprite_Character = {
  uuid: 0,
  list: {},
  create: function(name) {
    const spritesheet = new Image;
    spritesheet.src = "visual/sprite/character/" + name + ".png";
    if (!spritesheet) {
      return false;
    }
    const sprite = {
      heading: DIRECTION.DOWN,
      animation: { state: ANIMATION.IDLE, frame: { x: 0, y: 4 }, timer: { x: 0, y: 15 } },
      uuid: Sprite_Character.uuid++,
      spritesheet
    };
    Sprite_Character.list[name] = sprite;
    return true;
  },
  update: function() {
    for (const name in Sprite_Character.list) {
      const sprite = Sprite_Character.list[name];
      sprite.animation.timer.x++;
      if (sprite.animation.timer.x >= sprite.animation.timer.y) {
        sprite.animation.timer.x = 0;
        sprite.animation.frame.x++;
        if (sprite.animation.frame.x >= sprite.animation.frame.y) {
          sprite.animation.frame.x = 0;
        }
      }
    }
  }
};
var Debug = {
  gun: function() {
    const gun = Gun.get(Game.Gun);
    if (!gun) {
      return false;
    }
    if (Input.Keys["KeyQ"]) {
      gun.accuracy += 1;
    }
    if (Input.Keys["KeyE"]) {
      gun.accuracy -= 1;
    }
    if (Input.Keys["KeyR"]) {
      gun.projectiles += 1;
    }
    if (Input.Keys["KeyT"]) {
      gun.projectiles -= 1;
    }
    if (Input.Keys["KeyY"]) {
      gun.fire_rate.y += 1;
    }
    if (Input.Keys["KeyU"]) {
      gun.fire_rate.y -= 1;
    }
  },
  update: function() {
    const character = Character.get(Game.Character);
    if (!character) {
      return false;
    }
    const mouse_in_world = Vector.add(Input.Mouse, Display.Camera);
    Display.draw_rectangle(character.Position, { x: 32, y: 32 }, "RED");
    Display.draw_circle(mouse_in_world, 4, "blue");
    Display.draw_line(character.Position, mouse_in_world, "white");
  }
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
    if (magnitude === 0) {
      return { x: 0, y: 0 };
    }
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
  },
  clone: function(a) {
    return { x: a.x, y: a.y };
  }
};
var Display = {
  Camera: { x: 0, y: 0 },
  intialize: function() {
    Game.Canvas.addEventListener("mouseenter", function() {
      Game.Canvas.style.cursor = "none";
    });
    Game.Canvas.addEventListener("mouseleave", function() {
      Game.Canvas.style.cursor = "default";
    });
  },
  clear: function(color = CONFIG.COLOR_VOID) {
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
  draw_ring: function(position, r, thickness, color) {
    if (!Game.Context) {
      return false;
    }
    Game.Context.strokeStyle = color;
    Game.Context.beginPath();
    Game.Context.arc(position.x - Display.Camera.x, position.y - Display.Camera.y, r, 0, 2 * Math.PI);
    Game.Context.lineWidth = thickness;
    Game.Context.stroke();
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
    const character = Character.get(Game.Character);
    if (!character) {
      return false;
    }
    const mouse_in_world = Vector.add(Input.Mouse, Display.Camera);
    const target = Vector.add(character.Position, Vector.scale(Vector.subtract(mouse_in_world, character.Position), CONFIG.CAMERA_FOV));
    let distance = Vector.subtract(target, Display.Camera);
    distance = Vector.subtract(distance, { x: CONFIG.DISPLAY_WIDTH / 2, y: CONFIG.DISPLAY_HEIGHT / 2 });
    distance = Vector.scale(distance, CONFIG.CAMERA_EASE);
    distance = Vector.subtract(target, distance);
    Display.Camera.x = distance.x - CONFIG.DISPLAY_WIDTH / 2;
    Display.Camera.y = distance.y - CONFIG.DISPLAY_HEIGHT / 2;
    return true;
  },
  draw_character: function(name, position) {
    const sprite = Sprite_Character.list[name];
    if (!sprite) {
      return false;
    }
    if (!Game.Context) {
      return false;
    }
    let source_offset_x = 0;
    let source_offset_y = 0;
    switch (sprite.heading) {
      case DIRECTION.UP:
        source_offset_x += CONFIG.CHARACTER_SPRITE_SIZE * 1;
        source_offset_y += 0;
        break;
      case DIRECTION.DOWN:
        source_offset_x += CONFIG.CHARACTER_SPRITE_SIZE * 1;
        source_offset_y += CONFIG.CHARACTER_SPRITE_SIZE * 2;
        break;
      case DIRECTION.LEFT:
        source_offset_x += 0;
        source_offset_y += CONFIG.CHARACTER_SPRITE_SIZE * 1;
        break;
      case DIRECTION.RIGHT:
        source_offset_x += CONFIG.CHARACTER_SPRITE_SIZE * 2;
        source_offset_y += CONFIG.CHARACTER_SPRITE_SIZE * 1;
        break;
    }
    switch (sprite.animation.state) {
      case ANIMATION.IDLE:
        source_offset_x += 0;
        break;
      case ANIMATION.MOVE:
        source_offset_x += CONFIG.CHARACTER_SPRITE_SIZE * 3 * sprite.animation.frame.x;
        break;
      default:
        source_offset_x += 0;
        break;
    }
    Game.Context.drawImage(sprite.spritesheet, source_offset_x, source_offset_y, CONFIG.CHARACTER_SPRITE_SIZE, CONFIG.CHARACTER_SPRITE_SIZE, position.x - CONFIG.CHARACTER_SPRITE_SIZE / 2 - Display.Camera.x, position.y - CONFIG.CHARACTER_SPRITE_SIZE / 2 - Display.Camera.y, CONFIG.CHARACTER_SPRITE_SIZE, CONFIG.CHARACTER_SPRITE_SIZE);
    return true;
  },
  draw_gun: function(uuid, position, direction) {
    const gun = Gun.get(uuid);
    if (!gun) {
      return false;
    }
    const sprite = Sprite_Gun.list[gun.name + "_" + uuid.toString()];
    if (!sprite) {
      return false;
    }
    if (!Game.Context) {
      return false;
    }
    let source_offset_x = 0;
    switch (sprite.animation.state) {
      case ANIMATION.IDLE:
        source_offset_x += 0;
        break;
      case ANIMATION.FIRE:
        source_offset_x += CONFIG.GUN_SPRITE_SIZE * 1;
        break;
      case ANIMATION.MOVE:
        source_offset_x += CONFIG.GUN_SPRITE_SIZE * 2;
        break;
      case ANIMATION.RELOAD:
        source_offset_x += CONFIG.GUN_SPRITE_SIZE * 3;
        break;
      default:
        source_offset_x += 0;
        break;
    }
    Game.Context.save();
    Game.Context.translate(position.x - Display.Camera.x, position.y - Display.Camera.y);
    const angle = Math.atan2(direction.y, direction.x);
    Game.Context.rotate(angle);
    if (direction.x < 0) {
      Game.Context.scale(1, -1);
    }
    Game.Context.drawImage(sprite.spritesheet, source_offset_x, 0, CONFIG.GUN_SPRITE_SIZE, CONFIG.GUN_SPRITE_SIZE, 0, -CONFIG.GUN_SPRITE_SIZE / 2, CONFIG.GUN_SPRITE_SIZE, CONFIG.GUN_SPRITE_SIZE);
    Game.Context.restore();
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
  },
  update: function() {
    if (CONFIG.DEBUG_INPUT) {
      console.log(Input.Keys);
    }
    const character = Character.get(Game.Character);
    if (!character) {
      return false;
    }
    const gun = Gun.get(Game.Gun);
    if (!gun) {
      return false;
    }
    const mouse_in_world = Vector.add(Input.Mouse, Display.Camera);
    Display.draw_ring(mouse_in_world, 12, 2, "white");
  }
};
var Character = {
  uuid: 0,
  list: [],
  create: function(name) {
    const character = {
      name,
      Position: { x: Arena.Settings.Dimensions.x / 2, y: Arena.Settings.Dimensions.y / 2 },
      Dimensions: { x: 32, y: 32 },
      uuid: Character.uuid++,
      Health: { x: 3, y: 3 },
      speed: 5,
      magnetism: 128
    };
    Character.list.push(character);
    Sprite_Character.create(name);
    return character.uuid;
  },
  get: function(uuid) {
    return Character.list.find((character) => character.uuid === uuid);
  },
  update: function() {
    const character = Character.get(Game.Character);
    if (!character) {
      return false;
    }
    const sprite = Sprite_Character.list[character.name];
    if (!sprite) {
      return false;
    }
    const direction = Vector.clone({ x: 0, y: 0 });
    if (Input.Keys["KeyW"]) {
      direction.y -= character.speed;
    }
    if (Input.Keys["KeyS"]) {
      direction.y += character.speed;
    }
    if (Input.Keys["KeyA"]) {
      direction.x -= character.speed;
    }
    if (Input.Keys["KeyD"]) {
      direction.x += character.speed;
    }
    let normalized = Vector.normalize(direction);
    let scaled = Vector.scale(normalized, character.speed);
    character.Position = Vector.add(character.Position, scaled);
    if (scaled.x === 0 && scaled.y === 0) {
      sprite.animation.state = ANIMATION.IDLE;
      sprite.animation.frame.x = 0;
      sprite.animation.frame.y = 0;
    } else if (sprite.animation.state === ANIMATION.IDLE) {
      sprite.animation.state = ANIMATION.MOVE;
      sprite.animation.frame.x = 0;
      sprite.animation.frame.y = 4;
      sprite.animation.timer.x = 0;
      sprite.animation.timer.y = 8;
    }
    if (scaled.y > 0) {
      sprite.heading = DIRECTION.DOWN;
    } else if (scaled.y < 0) {
      sprite.heading = DIRECTION.UP;
    }
    if (Math.abs(scaled.x) > Math.abs(scaled.y)) {
      if (scaled.x > 0) {
        sprite.heading = DIRECTION.RIGHT;
      } else if (scaled.x < 0) {
        sprite.heading = DIRECTION.LEFT;
      }
    }
    character.Position.x = Math.max(character.Position.x, 0);
    character.Position.x = Math.min(character.Position.x, Arena.Settings.Dimensions.x);
    character.Position.y = Math.max(character.Position.y, 0);
    character.Position.y = Math.min(character.Position.y, Arena.Settings.Dimensions.y);
    Display.update();
    const mouse_to_camera = Vector.add(Input.Mouse, Display.Camera);
    if (Input.Mouse_Down) {
      Gun.fire(Game.Gun, Vector.add({ x: 0, y: 0 }, character.Position), Vector.normalize(Vector.subtract(mouse_to_camera, character.Position)));
    }
    Display.draw_character(character.name, character.Position);
  }
};
var Monster = {
  uuid: 0,
  list: [],
  Settings: {
    spawn_rate_per_second: 1
  },
  create: function(position, dimensions = { x: 32, y: 32 }, health = { x: 3, y: 3 }) {
    const monster = {
      Position: position,
      Dimensions: dimensions,
      uuid: Monster.uuid++,
      Health: health,
      Gun: Gun.create(5, 1, 2, 1, 1, 1, 60, false)
    };
    Monster.list.push(monster);
    return monster.uuid;
  },
  get: function(uuid) {
    return Monster.list.find((monster) => monster.uuid === uuid);
  },
  update: function() {
    const character = Character.get(Game.Character);
    if (!character) {
      return false;
    }
    if (Game.time_frames % CONFIG.FPS / Monster.Settings.spawn_rate_per_second === 0) {
      if (Monster.list.length < CONFIG.MONSTER_LIMIT) {
        const side = Math.floor(Math.random() * 4);
        let position = { x: 0, y: 0 };
        switch (side) {
          case 0:
            position = {
              x: character.Position.x - CONFIG.DISPLAY_WIDTH / 2 + Math.random() * CONFIG.DISPLAY_WIDTH,
              y: character.Position.y - CONFIG.DISPLAY_HEIGHT / 2 - Math.random() * 128
            };
            break;
          case 1:
            position = {
              x: character.Position.x + CONFIG.DISPLAY_WIDTH / 2 + Math.random() * 128,
              y: character.Position.y - CONFIG.DISPLAY_HEIGHT / 2 + Math.random() * CONFIG.DISPLAY_HEIGHT
            };
            break;
          case 2:
            position = {
              x: character.Position.x - CONFIG.DISPLAY_WIDTH / 2 + Math.random() * CONFIG.DISPLAY_WIDTH,
              y: character.Position.y + CONFIG.DISPLAY_HEIGHT / 2 + Math.random() * 128
            };
            break;
          case 3:
            position = {
              x: character.Position.x - CONFIG.DISPLAY_WIDTH / 2 - Math.random() * 128,
              y: character.Position.y - CONFIG.DISPLAY_HEIGHT / 2 + Math.random() * CONFIG.DISPLAY_HEIGHT
            };
            break;
        }
        Monster.create(position);
      }
    }
    for (let m = 0;m < Monster.list.length; m++) {
      const monster = Monster.list[m];
      if (monster.Health.x <= 0) {
        Gun.remove(monster.Gun);
        Monster.list.splice(m, 1);
        m--;
        Orb.create(monster.Position);
        continue;
      }
      const direction = Vector.normalize(Vector.subtract(character.Position, monster.Position));
      monster.Position.x += direction.x;
      monster.Position.y += direction.y;
      Gun.fire(monster.Gun, Vector.clone(monster.Position), direction);
      Display.draw_rectangle(monster.Position, monster.Dimensions, CONFIG.COLOR_MONSTER);
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
    if (Projectile.good_list.length > CONFIG.PROJECTILE_LIMIT_GOOD && CONFIG.PERFORMANCE_ENTITY_LIMTER) {
      const excess = Projectile.good_list.length - CONFIG.PROJECTILE_LIMIT_GOOD;
      Projectile.good_list.splice(CONFIG.PROJECTILE_LIMIT_GOOD, excess);
    }
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
      Display.draw_circle(projectile.Position, projectile.Dimensions.x, CONFIG.COLOR_PROJECTILE_GOOD);
    }
    if (Projectile.evil_list.length > CONFIG.PROJECTILE_LIMIT_EVIL && CONFIG.PERFORMANCE_ENTITY_LIMTER) {
      const excess = Projectile.evil_list.length - CONFIG.PROJECTILE_LIMIT_EVIL;
      Projectile.evil_list.splice(CONFIG.PROJECTILE_LIMIT_EVIL, excess);
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
      for (let p = 0;p < Character.list.length; p++) {
        const character = Character.list[p];
        if (Math.abs(projectile.Position.x - character.Position.x) < character.Dimensions.x / 6) {
          if (Math.abs(projectile.Position.y - character.Position.y) < character.Dimensions.y / 6) {
            character.Health.x -= 1;
            Projectile.evil_list.splice(e, 1);
            e--;
            break;
          }
        }
      }
      Display.draw_circle(projectile.Position, projectile.Dimensions.x, CONFIG.COLOR_PROJECTILE_BAD);
    }
  }
};
var Sprite_Gun = {
  list: {},
  create: function(name, uuid) {
    const spritesheet = new Image;
    spritesheet.src = "visual/sprite/gun/" + name + ".png";
    if (!spritesheet) {
      return false;
    }
    const sprite = {
      uuid,
      spritesheet,
      animation: {
        state: ANIMATION.IDLE,
        frame: { x: 0, y: 1 },
        timer: { x: 0, y: 1 }
      }
    };
    Sprite_Gun.list[name + "_" + uuid.toString()] = sprite;
    return true;
  }
};
var Gun_SFX = {
  list: {},
  create: function(name) {
    const fire = {
      index: 0,
      list: []
    };
    for (let f = 0;f < CONFIG.GUN_FIRE_POOL; f++) {
      const audio = new Audio("audio/sfx/" + name + "/fire.wav");
      fire.list.push(audio);
    }
    const reload = {
      index: 0,
      list: []
    };
    for (let r = 0;r < CONFIG.GUN_RELOAD_POOL; r++) {
      const audio = new Audio("audio/sfx/" + name + "/reload.wav");
      reload.list.push(audio);
    }
    const sfx = {
      Fire: fire,
      Reload: reload
    };
    Gun_SFX.list[name] = sfx;
  },
  fire: function(name) {
    const sfx = Gun_SFX.list[name];
    if (!sfx) {
      return false;
    }
    sfx.Fire.list[sfx.Fire.index].play();
    sfx.Fire.index++;
    if (sfx.Fire.index >= sfx.Fire.list.length) {
      sfx.Fire.index = 0;
    }
  },
  reload: function(name) {
    const sfx = Gun_SFX.list[name];
    if (!sfx) {
      return false;
    }
    sfx.Reload.list[sfx.Reload.index].play();
    sfx.Reload.index++;
    if (sfx.Reload.index >= sfx.Reload.list.length) {
      sfx.Reload.index = 0;
    }
  }
};
var Gun = {
  list: [],
  create: function(accuracy_degrees = 20, damage = 1, bullet_speed = 5, projectiles = 1, fire_rate = 10, magazine = 15, reload_time = 60, good = true, name = "") {
    const gun = {
      accuracy: accuracy_degrees,
      damage,
      bullet_speed,
      bullet_range: 1000,
      bullet_size: 4,
      projectiles,
      trigger_pulled: false,
      fire_rate: { x: 0, y: fire_rate },
      magazine: { x: magazine, y: magazine },
      reload_time: { x: reload_time, y: reload_time },
      good,
      uuid: Gun.list.length,
      name
    };
    Gun.list.push(gun);
    if (name !== "") {
      Sprite_Gun.create(name, gun.uuid);
      Gun_SFX.create(name);
    }
    return gun.uuid;
  },
  update: function() {
    for (let g = 0;g < Gun.list.length; g++) {
      const gun = Gun.list[g];
      let animation = ANIMATION.IDLE;
      if (gun.reload_time.x < gun.reload_time.y) {
        gun.reload_time.x++;
        animation = ANIMATION.RELOAD;
        if (gun.reload_time.x >= gun.reload_time.y) {
          gun.magazine.x = gun.magazine.y;
          animation = ANIMATION.IDLE;
          Gun_SFX.reload(gun.name);
        }
      }
      if (gun.fire_rate.x < gun.fire_rate.y) {
        gun.fire_rate.x++;
        if (gun.fire_rate.x === 1) {
          animation = ANIMATION.FIRE;
        }
      }
      if (gun.magazine.x < 1 && gun.reload_time.x >= gun.reload_time.y) {
        gun.reload_time.x = 0;
      }
      if (gun.name !== "") {
        const sprite = Sprite_Gun.list[gun.name + "_" + gun.uuid.toString()];
        if (!sprite) {
          continue;
        }
        sprite.animation.state = animation;
        const character = Character.get(Game.Character);
        if (!character) {
          return false;
        }
        const mouse_in_world = Vector.add(Input.Mouse, Display.Camera);
        Display.draw_gun(gun.uuid, character.Position, Vector.normalize(Vector.subtract(mouse_in_world, character.Position)));
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
    const spread = gun_data.trigger_pulled ? gun_data.accuracy : 0;
    gun_data.trigger_pulled = true;
    const sprite = Sprite_Gun.list[gun_data.name + "_" + gun_data.uuid.toString()];
    if (sprite) {
      sprite.animation.state = ANIMATION.FIRE;
      sprite.animation.frame.x = 0;
      sprite.animation.frame.y = 0;
      sprite.animation.timer.x = 0;
      sprite.animation.timer.y = 8;
    }
    Gun_SFX.fire(gun_data.name);
    for (let p = 0;p < gun_data.projectiles; p++) {
      Projectile.create(Vector.clone(position), Vector.rotate(Vector.scale(direction, gun_data.bullet_speed), (Math.random() - 0.5) * spread), gun_data.damage, gun_data.bullet_size, gun_data.bullet_range / gun_data.bullet_speed, gun_data.good);
    }
  },
  remove: function(uuid) {
    const gun = Gun.get(uuid);
    if (!gun) {
      return false;
    }
    Gun.list.splice(uuid, 1);
    return true;
  }
};
var Orb = {
  uuid: 0,
  list: [],
  create: function(position, dimensions = { x: 8, y: 8 }) {
    const orb = {
      Position: position,
      Dimensions: dimensions,
      uuid: Orb.uuid++
    };
    Orb.list.push(orb);
    return orb.uuid;
  },
  get: function(uuid) {
    return Orb.list.find((orb) => orb.uuid === uuid);
  },
  update: function() {
    const character = Character.get(Game.Character);
    if (!character) {
      return false;
    }
    for (let o = 0;o < Orb.list.length; o++) {
      const orb = Orb.list[o];
      const direction = Vector.subtract(character.Position, orb.Position);
      const distance = Vector.magnitude(direction);
      if (distance < character.magnetism) {
        orb.Position.x += direction.x / distance * character.speed * 1.25;
        orb.Position.y += direction.y / distance * character.speed * 1.25;
      }
      if (Math.abs(orb.Position.x - character.Position.x) < character.Dimensions.x / 2) {
        if (Math.abs(orb.Position.y - character.Position.y) < character.Dimensions.y / 2) {
          Orb.list.splice(o, 1);
          o--;
          Game.Experience++;
          continue;
        }
      }
      Display.draw_circle(orb.Position, orb.Dimensions.x, CONFIG.COLOR_ORB);
    }
  }
};
var Arena = {
  Settings: {
    Dimensions: { x: 1000, y: 1000 }
  },
  update: function() {
    Display.draw_rectangle({ x: Arena.Settings.Dimensions.x / 2, y: Arena.Settings.Dimensions.y / 2 }, Arena.Settings.Dimensions, CONFIG.COLOR_ARENA);
  }
};
var Game = {
  Canvas: null,
  Context: null,
  Loop: null,
  time_frames: 0,
  time_ms: 0,
  Character: -1,
  Gun: -1,
  Experience: 0,
  initialize: function() {
    Game.Canvas = document.getElementById(CONFIG.DISPLAY_NAME);
    Game.Context = Game.Canvas.getContext("2d");
    Game.Canvas.width = CONFIG.DISPLAY_WIDTH;
    Game.Canvas.height = CONFIG.DISPLAY_HEIGHT;
    Game.Context.fillStyle = CONFIG.COLOR_VOID;
    Game.Context.fillRect(0, 0, CONFIG.DISPLAY_WIDTH, CONFIG.DISPLAY_HEIGHT);
    Input.initialize();
    Display.intialize();
    Game.Character = Character.create("kira");
    Game.Gun = Gun.create(undefined, undefined, undefined, undefined, undefined, undefined, undefined, true, "pistol");
    Game.Loop = setInterval(Game.update, 1000 / CONFIG.FPS);
  },
  update: function() {
    const character = Character.get(0);
    if (!character) {
      return false;
    }
    if (CONFIG.DEBUG_GUN) {
      Debug.gun();
    }
    Display.clear();
    Arena.update();
    Gun.update();
    Sprite_Character.update();
    Character.update();
    Monster.update();
    Projectile.update();
    Orb.update();
    Input.update();
    if (CONFIG.DEBUG_RENDERER) {
      Debug.update();
    }
    if (CONFIG.DEBUG_PERFORMANCE) {
      const new_time_ms = performance.now();
      const delta_time_ms = new_time_ms - Game.time_ms;
      Display.draw_text(character.Position, `FPS: ${Math.round(1000 / delta_time_ms)}`);
      Game.time_ms = new_time_ms;
      Display.draw_text({ x: character.Position.x, y: character.Position.y + 16 }, `Entities: ${Character.list.length + Monster.list.length + Projectile.good_list.length + Projectile.evil_list.length}`);
    }
    Game.time_frames++;
  }
};
document.addEventListener("DOMContentLoaded", () => {
  Game.initialize();
});
