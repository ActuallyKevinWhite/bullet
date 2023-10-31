/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
const CONFIG = {
    DISPLAY_NAME: "display",
    DISPLAY_WIDTH: 512,
    DISPLAY_HEIGHT: 320,

    DEBUG_INPUT: false,
    DEBUG_PERFORMANCE: true,
    DEBUG_RENDERER: false,

    DEBUG_GUN: true,

    PERFORMANCE_ENTITY_LIMTER: false,

    PROJECTILE_LIMIT_GOOD:  5000,
    PROJECTILE_LIMIT_EVIL: 15000,

    MONSTER_LIMIT: 1000,

    FPS: 60,
}
const Debug = {
    gun: function () {
        const gun = Gun.get(Game.Gun);
        if (!gun) { return false; }
        if (Input.Keys["KeyQ"]) { gun.accuracy += 1; }
        if (Input.Keys["KeyE"]) { gun.accuracy -= 1; }
        if (Input.Keys["KeyR"]) { gun.projectiles   += 1; }
        if (Input.Keys["KeyT"]) { gun.projectiles   -= 1; }
        if (Input.Keys["KeyY"]) { gun.fire_rate.y   += 1; }
        if (Input.Keys["KeyU"]) { gun.fire_rate.y   -= 1; }
    },
    update: function () {
        const player = Player.get(Game.Player);
        if (!player) { return false; }
        const mouse_in_world = Vector.add(Input.Mouse, Display.Camera);
        Display.draw_rectangle(player.Position, { x: 32, y: 32 }, 'red')
        // Draw the mouse position
        Display.draw_circle(mouse_in_world, 4, 'blue');
        // Draw line connecting them
        Display.draw_line(player.Position, mouse_in_world, 'white');
    }
}
interface Vector {
    x: number,
    y: number
}
const Vector = {
    add: function (a: Vector, b: Vector) {
        return { x: a.x + b.x, y: a.y + b.y };
    },
    subtract: function (a: Vector, b: Vector) {
        return { x: a.x - b.x, y: a.y - b.y };
    },
    multiply: function (a: Vector, b: Vector) {
        return { x: a.x * b.x, y: a.y * b.y };
    },
    divide: function (a: Vector, b: Vector) {
        return { x: a.x / b.x, y: a.y / b.y };
    },
    magnitude: function (a: Vector) {
        return Math.sqrt(a.x * a.x + a.y * a.y);
    },
    normalize: function (a: Vector) {
        const magnitude = Vector.magnitude(a);
        if (magnitude === 0) { return { x: 0, y: 0 }; }
        return { x: a.x / magnitude, y: a.y / magnitude };
    },
    scale: function (a: Vector, scalar: number) {
        return { x: a.x * scalar, y: a.y * scalar };
    },
    rotate: function (a: Vector, angle: number) {
        angle = angle * Math.PI / 180;
        return {
            x: a.x * Math.cos(angle) - a.y * Math.sin(angle),
            y: a.x * Math.sin(angle) + a.y * Math.cos(angle)
        };
    },
    clone: function (a: Vector) {
        return { x: a.x, y: a.y };
    }
}
const Display = {
    Camera: { x: 0, y: 0 },
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
        // Draw the rectangle centered on the position relative to the camera
        Game.Context.fillRect(
            position.x - dimensions.x / 2 - Display.Camera.x,
            position.y - dimensions.y / 2 - Display.Camera.y,
            dimensions.x,
            dimensions.y
        );
        return true;
    },
    draw_circle: function (position: Vector, r: number, color: string) {
        if (!Game.Context) { return false; }
        Game.Context.fillStyle = color;
        Game.Context.beginPath();
        Game.Context.arc(
            position.x - Display.Camera.x,
            position.y - Display.Camera.y,
            r, 0, 2 * Math.PI
        );
        Game.Context.fill();
        return true;
    },
    draw_line: function (start: Vector, end: Vector, color: string) {
        if (!Game.Context) { return false; }
        Game.Context.strokeStyle = color;
        Game.Context.beginPath();
        Game.Context.moveTo(
            start.x - Display.Camera.x,
            start.y - Display.Camera.y
        );
        Game.Context.lineTo(
            end.x - Display.Camera.x, 
            end.y - Display.Camera.y
        );
        Game.Context.stroke();
        return true;
    },
    draw_text: function (position: Vector, text: string) {
        if (!Game.Context) { return false; }
        // Draw the text centered on the position
        Game.Context.fillStyle = "white";
        const size = 16;
        Game.Context.font = `${size}px Arial`;
        Game.Context.textAlign = "center";
        Game.Context.fillText(
            text, 
            position.x - Display.Camera.x, 
            position.y + size / 2 - Display.Camera.y
        );
    },
    update: function () {
        const player = Player.get(Game.Player);
        if (!player) { return false; }
        Display.Camera.x = player.Position.x - CONFIG.DISPLAY_WIDTH / 2;
        Display.Camera.y = player.Position.y - CONFIG.DISPLAY_HEIGHT / 2;
        return true;
    }
}
const Input = {
    Mouse: {x: 0, y: 0},
    Mouse_Down: false,
    Keys: {} as {[key: string]: boolean},

    initialize: function () {
        document.addEventListener("keydown",
            function (event) {
                if (CONFIG.DEBUG_INPUT) { console.log(event.code); }
                Input.Keys[event.code] = true;
            }
        );
        document.addEventListener("keyup",
            function (event) {
                if (CONFIG.DEBUG_INPUT) { console.log(event.code); }
                Input.Keys[event.code] = false;
            }
        );
        document.addEventListener("mousemove",
            function (event) {
                const rect = Game.Canvas?.getBoundingClientRect();
                if (rect) {
                    Input.Mouse.x = event.clientX - rect.left;
                    Input.Mouse.y = event.clientY - rect.top;
                }
            }
        );
        document.addEventListener("mousedown",
            function (event) {
                Input.Mouse_Down = true;
            }
        );
        document.addEventListener("mouseup",
            function (event) {
                Input.Mouse_Down = false;
            }
        );
    },
}
interface Player {
    Position:   Vector,
    Dimensions: Vector,
    Health:     Vector, // x: current, y: max
    magnetism:  number,
    speed:      number,
    uuid: number
}
const Player = {
    uuid: 0,
    list: [] as Player[],
    create: function (position: Vector, dimensions: Vector = { x: 32, y: 32 }, health: Vector = { x: 3, y: 3 }) {
        const player = {
            Position:   position,
            Dimensions: dimensions,
            uuid:       Player.uuid++,
            Health:     health,
            speed:      5,
            magnetism:  128,
        }
        Player.list.push(player);
        return player.uuid;
    },
    get: function (uuid: number) {
        return Player.list.find(player => player.uuid === uuid);
    },
    update: function () {
        const player = Player.get(Game.Player);
        if (!player) { return false; }
        // Move the player
        const direction = Vector.clone({x: 0, y: 0});
        if (Input.Keys["KeyW"]) { direction.y -= player.speed; }
        if (Input.Keys["KeyS"]) { direction.y += player.speed; }
        if (Input.Keys["KeyA"]) { direction.x -= player.speed; }
        if (Input.Keys["KeyD"]) { direction.x += player.speed; }
        let normalized  = Vector.normalize(direction);
        let scaled      = Vector.scale(normalized, player.speed);
        player.Position = Vector.add(player.Position, scaled);
        // Clamp player to Arena
        player.Position.x = Math.max(player.Position.x, 0);
        player.Position.x = Math.min(player.Position.x, Arena.Settings.Dimensions.x);
        player.Position.y = Math.max(player.Position.y, 0);
        player.Position.y = Math.min(player.Position.y, Arena.Settings.Dimensions.y);
        // Shoot a bullet in the direction of the mouse from the player
        Display.update();
        const mouse_to_camera = Vector.add(Input.Mouse, Display.Camera);
        if (Input.Mouse_Down) {
            Gun.fire(Game.Gun, Vector.add({x: 0, y: 0}, player.Position), Vector.normalize(Vector.subtract(mouse_to_camera, player.Position)));
        }
        // Render player
        Display.draw_rectangle(player.Position, player.Dimensions, 'red');
    }
}
interface Monster {
    Position:   Vector,
    Dimensions: Vector,
    Health:     Vector, // x: current, y: max
    uuid: number,
    Gun: number,
}
const Monster = {
    uuid: 0,
    list: [] as Monster[],
    Settings: {
        spawn_rate_per_second: 1,
    },
    create: function (position: Vector, dimensions: Vector = { x: 32, y: 32 }, health: Vector = { x: 10, y: 10 }) {
        const monster = {
            Position:   position,
            Dimensions: dimensions,
            uuid:       Monster.uuid++,
            Health:     health,
            Gun:        Gun.create(5, 1, 2, 1, 1, 1, 60, false),
        }
        Monster.list.push(monster);
        return monster.uuid;
    },
    get: function (uuid: number) {
        return Monster.list.find(monster => monster.uuid === uuid);
    },
    update: function () {
        const player = Player.get(Game.Player);
        if (!player) { return false; }

        if (Game.time_frames % CONFIG.FPS / Monster.Settings.spawn_rate_per_second === 0) {
            if (Monster.list.length < CONFIG.MONSTER_LIMIT) {
                // Spawn monsters off screen
                const side = Math.floor(Math.random() * 4);
                let position = {x: 0, y: 0}
                switch (side) {
                    case 0: // Top
                        position = { 
                            x: player.Position.x - CONFIG.DISPLAY_WIDTH / 2 + Math.random() * CONFIG.DISPLAY_WIDTH,
                            y: player.Position.y - CONFIG.DISPLAY_HEIGHT / 2 - Math.random() * 128
                        };
                        break;
                    case 1: // Right
                        position = { 
                            x: player.Position.x + CONFIG.DISPLAY_WIDTH / 2 + Math.random() * 128,
                            y: player.Position.y - CONFIG.DISPLAY_HEIGHT / 2 + Math.random() * CONFIG.DISPLAY_HEIGHT
                        };
                        break;
                    case 2: // Bottom
                        position = { 
                            x: player.Position.x - CONFIG.DISPLAY_WIDTH / 2 + Math.random() * CONFIG.DISPLAY_WIDTH,
                            y: player.Position.y + CONFIG.DISPLAY_HEIGHT / 2 + Math.random() * 128
                        };
                        break;
                    case 3: // Left
                        position = { 
                            x: player.Position.x - CONFIG.DISPLAY_WIDTH / 2 - Math.random() * 128,
                            y: player.Position.y - CONFIG.DISPLAY_HEIGHT / 2 + Math.random() * CONFIG.DISPLAY_HEIGHT
                        };
                        break;
                }
                Monster.create(position);
            }
        }
        for (let m = 0; m < Monster.list.length; m++) {
            const monster = Monster.list[m];
            // Check if dead
            if (monster.Health.x <= 0) {
                Gun.remove(monster.Gun);
                Monster.list.splice(m, 1);
                m--;
                Orb.create(monster.Position);
                continue;
            }
            // Head towards player
            const direction = Vector.normalize(Vector.subtract(player.Position, monster.Position));
            monster.Position.x += direction.x;
            monster.Position.y += direction.y;
            // Shoot at player
            Gun.fire(monster.Gun, Vector.clone(monster.Position), direction);
            // Render monster
            Display.draw_rectangle(monster.Position, monster.Dimensions, 'blue');
        }
    }
}
interface Projectile {
    Position:   Vector,
    Velocity:   Vector,
    Dimensions: Vector,
    damage:     number, // How much HP it does
    Timer:      Vector, // How long it lasts
}
const Projectile = {
    good_list: [] as Projectile[],
    evil_list: [] as Projectile[],
    create: function (position: Vector, velocity: Vector, damage: number, size: number, duration: number, good: boolean) {
        const projectile = {
            Position: position,
            Velocity: velocity,
            damage:   damage,
            Timer:    {x: 0, y: duration},
            Dimensions: {x: size, y: size},
        }
        if (good) {
            Projectile.good_list.push(projectile);
        } else {
            Projectile.evil_list.push(projectile);
        }
        return true;
    },
    update: function () {
        if (Projectile.good_list.length > CONFIG.PROJECTILE_LIMIT_GOOD && CONFIG.PERFORMANCE_ENTITY_LIMTER) {
            // Remove the newest projectiles
            const excess = Projectile.good_list.length - CONFIG.PROJECTILE_LIMIT_GOOD;
            Projectile.good_list.splice(CONFIG.PROJECTILE_LIMIT_GOOD, excess);
        }
        for (let g = 0; g < Projectile.good_list.length; g++) {
            const projectile = Projectile.good_list[g];
            projectile.Position.x += projectile.Velocity.x;
            projectile.Position.y += projectile.Velocity.y;
            projectile.Timer.x++;
            if (projectile.Timer.x >= projectile.Timer.y) {
                Projectile.good_list.splice(g, 1);
                g--;
                continue;
            }
            // TODO: Check for collisions with Monsters
            for (let m = 0; m < Monster.list.length; m++) {
                const monster = Monster.list[m];
                if (Math.abs(projectile.Position.x - monster.Position.x) < monster.Dimensions.x / 2) {
                    if (Math.abs(projectile.Position.y - monster.Position.y) < monster.Dimensions.y / 2) {
                        monster.Health.x -= projectile.damage; // TODO: Damage the monster
                        Projectile.good_list.splice(g, 1);
                        g--;
                        break;
                    }
                }
            }
            Display.draw_circle(projectile.Position, projectile.Dimensions.x, 'green');
        }
        if (Projectile.evil_list.length > CONFIG.PROJECTILE_LIMIT_EVIL && CONFIG.PERFORMANCE_ENTITY_LIMTER) {
            // Remove the newest projectiles
            const excess = Projectile.evil_list.length - CONFIG.PROJECTILE_LIMIT_EVIL;
            Projectile.evil_list.splice(CONFIG.PROJECTILE_LIMIT_EVIL, excess);
        }
        for (let e = 0; e < Projectile.evil_list.length; e++) {
            const projectile = Projectile.evil_list[e];
            projectile.Position.x += projectile.Velocity.x;
            projectile.Position.y += projectile.Velocity.y;
            projectile.Timer.x++;
            if (projectile.Timer.x >= projectile.Timer.y) {
                Projectile.evil_list.splice(e, 1);
                e--;
                continue;
            }
            // Check for collisions with Player
            for (let p = 0; p < Player.list.length; p++) {
                const player = Player.list[p];
                if (Math.abs(projectile.Position.x - player.Position.x) < player.Dimensions.x / 2) {
                    if (Math.abs(projectile.Position.y - player.Position.y) < player.Dimensions.y / 2) {
                        player.Health.x -= 1; // TODO: Damage the player
                        Projectile.evil_list.splice(e, 1);
                        e--;
                        break;
                    }
                }
            }
            Display.draw_circle(projectile.Position, projectile.Dimensions.x, 'blue');
        }
    }    
}
interface Gun {
    accuracy:     number, // How accurate the gun is (degrees)
    damage:       number, // How much damage the gun does
    bullet_speed: number,
    bullet_range: number,
    bullet_size:  number,
    projectiles:  number, // How many bullets the gun fires at once
    fire_rate:    Vector, // How many frames before the gun can fire again
    magazine:     Vector, // How many bullets the gun can hold
    reload_time:  Vector, // How many frames it takes to reload
    good:         boolean,
    uuid:         number
}
const Gun = {
    list: [] as Gun[],
    create: function (accuracy_degrees: number = 0, damage: number = 1, bullet_speed: number = 5, projectiles: number = 1, fire_rate: number = 1, magazine: number = 1, reload_time: number = 1, good: boolean = true) {
        const gun = {
            accuracy:     accuracy_degrees,
            damage:       damage,
            bullet_speed: bullet_speed,
            bullet_range: 1000,
            bullet_size:  4,
            projectiles:  projectiles,
            fire_rate:    {x: 0, y: fire_rate},
            magazine:     {x: magazine, y: magazine},
            reload_time:  {x: reload_time, y: reload_time},
            good:         good,
            uuid:         Gun.list.length,
        }
        Gun.list.push(gun);
        return gun.uuid;
    },
    update: function () {
        for (let g = 0; g < Gun.list.length; g++) {
            const gun = Gun.list[g];
            // Reload
            if (gun.reload_time.x < gun.reload_time.y) {
                gun.reload_time.x++;
                // Check if reloaded
                if (gun.reload_time.x >= gun.reload_time.y) {
                    gun.magazine.x = gun.magazine.y;
                }
            }
            // Fire
            if (gun.fire_rate.x < gun.fire_rate.y) {
                gun.fire_rate.x++;
            }
            // Start reloading if the magazine is empty
            if (gun.magazine.x < 1 && gun.reload_time.x >= gun.reload_time.y) {
                gun.reload_time.x = 0;
            }
        }
    },
    get: function (uuid: number) {
        return Gun.list.find(gun => gun.uuid === uuid);
    },
    fire: function (gun: number, position: Vector, direction: Vector) {
        const gun_data = Gun.get(gun);
        if (!gun_data) { return false; }
        // Check if the gun has bullets
        if (gun_data.magazine.x < 1) { return false; }
        // Check if the gun is ready to fire
        if (gun_data.fire_rate.x < gun_data.fire_rate.y) { return false; }
        // Finally fire the gun!
        gun_data.magazine.x--;
        gun_data.fire_rate.x = 0;
        for (let p = 0; p < gun_data.projectiles; p++) {
            console.log
            Projectile.create(
                Vector.clone(position),
                Vector.rotate(Vector.scale(direction, gun_data.bullet_speed), (Math.random() - 0.5) * gun_data.accuracy),
                gun_data.damage,
                gun_data.bullet_size,
                gun_data.bullet_range / gun_data.bullet_speed,
                gun_data.good
            );
        }
    },
    remove: function (uuid: number) {
        const gun = Gun.get(uuid);
        if (!gun) { return false; }
        Gun.list.splice(uuid, 1);
        return true;
    }
}
interface Orb {
    Position: Vector,
    Dimensions: Vector,
    uuid: number,
}
const Orb = {
    uuid: 0,
    list: [] as Orb[],
    create: function (position: Vector, dimensions: Vector = { x: 8, y: 8 }) {
        const orb = {
            Position:   position,
            Dimensions: dimensions,
            uuid:       Orb.uuid++,
        }
        Orb.list.push(orb);
        return orb.uuid;
    },
    get: function (uuid: number) {
        return Orb.list.find(orb => orb.uuid === uuid);
    },
    update: function () {
        const player = Player.get(Game.Player);
        if (!player) { return false; }
        for (let o = 0; o < Orb.list.length; o++) {
            const orb = Orb.list[o];
            // Move towards player if player is within range
            const direction = Vector.subtract(player.Position, orb.Position);
            const distance = Vector.magnitude(direction);
            if (distance < player.magnetism) {
                // Move towards player faster the closer the player is
                orb.Position.x += direction.x / distance * player.speed * 1.25;
                orb.Position.y += direction.y / distance * player.speed * 1.25;
            }
            // Check for collisions with player
            if (Math.abs(orb.Position.x - player.Position.x) < player.Dimensions.x / 2) {
                if (Math.abs(orb.Position.y - player.Position.y) < player.Dimensions.y / 2) {
                    // Make the orb disappear and increase the player's experience
                    Orb.list.splice(o, 1);
                    o--;
                    Game.Experience++;
                    continue;
                }
            }
            // Render orb
            Display.draw_circle(orb.Position, orb.Dimensions.x, 'yellow');
        }
    }
}
const Arena = {
    Settings: {
        Dimensions: {x: 1000, y: 1000}
    },
    update: function () {
        Display.draw_rectangle({x: Arena.Settings.Dimensions.x / 2, y: Arena.Settings.Dimensions.y / 2}, Arena.Settings.Dimensions, 'purple')
    }
}
const Game = {
    Canvas:  null as HTMLCanvasElement        | null,
    Context: null as CanvasRenderingContext2D | null,

    Loop: null as Timer | null,

    time_frames: 0,
    time_ms:     0,

    Player: -1,

    Gun: -1,

    Experience: 0,

    initialize: function () {
        Game.Canvas  = document.getElementById(CONFIG.DISPLAY_NAME) as HTMLCanvasElement;
        Game.Context = Game.Canvas.getContext("2d")                 as CanvasRenderingContext2D;

        Game.Canvas.width  = CONFIG.DISPLAY_WIDTH;
        Game.Canvas.height = CONFIG.DISPLAY_HEIGHT;

        Game.Context.fillStyle = "black";
        Game.Context.fillRect(0, 0, CONFIG.DISPLAY_WIDTH, CONFIG.DISPLAY_HEIGHT);

        Input.initialize();

        Game.Player = Player.create({ x: CONFIG.DISPLAY_WIDTH / 2, y: CONFIG.DISPLAY_HEIGHT / 2 });
        Game.Gun  = Gun.create()
        Game.Loop = setInterval(Game.update, 1000 / CONFIG.FPS);
    },
    update: function () {
        const player = Player.get(0);
        if (!player) { return false; }
        // Increase gun spread
        if (CONFIG.DEBUG_GUN) {Debug.gun();}
        Display.clear();
        Arena.update();
        // Input
        Gun.update();
        Player.update();
        // Move the mosnters
        Monster.update();
        // Move the projectiles
        Projectile.update();
        // Move the orbs
        Orb.update();
        // Draw player
        if (CONFIG.DEBUG_RENDERER) { Debug.update(); }

        if (CONFIG.DEBUG_PERFORMANCE) {
            const new_time_ms = performance.now();
            const delta_time_ms = new_time_ms - Game.time_ms;
            Display.draw_text(player.Position, `FPS: ${Math.round(1000 / delta_time_ms)}`);
            Game.time_ms = new_time_ms;
            Display.draw_text({x: player.Position.x, y: player.Position.y + 16}, `Entities: ${Player.list.length + Monster.list.length + Projectile.good_list.length + Projectile.evil_list.length}`);
        }
        Game.time_frames++;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    Game.initialize();
});