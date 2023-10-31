/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
const CONFIG = {
    DISPLAY_NAME: "display",
    DISPLAY_WIDTH: 512,
    DISPLAY_HEIGHT: 320,

    DEBUG_INPUT: false,
    DEBUG_PERFORMANCE: false,
    DEBUG_RENDERER: true,

    FPS: 60,
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
        return { x: a.x / magnitude, y: a.y / magnitude };
    },
    scale: function (a: Vector, scalar: number) {
        return { x: a.x * scalar, y: a.y * scalar };
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
        if (Input.Keys["KeyW"]) { player.Position.y -= 5; }
        if (Input.Keys["KeyA"]) { player.Position.x -= 5; }
        if (Input.Keys["KeyS"]) { player.Position.y += 5; }
        if (Input.Keys["KeyD"]) { player.Position.x += 5; }
        // Clamp player to Arena
        player.Position.x = Math.max(player.Position.x, 0);
        player.Position.x = Math.min(player.Position.x, Game.Arena.x);
        player.Position.y = Math.max(player.Position.y, 0);
        player.Position.y = Math.min(player.Position.y, Game.Arena.y);
        // Shoot a bullet in the direction of the mouse from the player
        Display.update();
        const mouse_to_camera = Vector.add(Input.Mouse, Display.Camera);
        if (Input.Mouse_Down) {
            const direction = Vector.normalize(Vector.subtract(mouse_to_camera, player.Position));
            Projectile.create(
                Vector.add(player.Position, Vector.scale(direction, 32)),
                Vector.scale(direction, 10),
                1,
                5,
                60,
                true
            );
        }
        // Render player
        Display.draw_rectangle(player.Position, player.Dimensions, 'red');
    }
}
const Debug = {
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
interface Monster {
    Position:   Vector,
    Dimensions: Vector,
    Health:     Vector, // x: current, y: max
    uuid: number
}
const Monster = {
    list: [] as Monster[],
    create: function (position: Vector, dimensions: Vector = { x: 32, y: 32 }, health: Vector = { x: 10, y: 10 }) {
        const monster = {
            Position:   position,
            Dimensions: dimensions,
            uuid:       Player.uuid++,
            Health:     health,
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

        if (Game.time_frames % (CONFIG.FPS * 0.5) === 0) {
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
        for (let m = 0; m < Monster.list.length; m++) {
            const monster = Monster.list[m];
            // Check if dead
            if (monster.Health.x <= 0) {
                Monster.list.splice(m, 1);
                m--;
                continue;
            }
            // Head towards player
            const direction = Vector.normalize(Vector.subtract(player.Position, monster.Position));
            monster.Position.x += direction.x;
            monster.Position.y += direction.y;
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
        }
    }    
}
const Arena = {
    update: function () {
        Display.draw_rectangle({x: Game.Arena.x / 2, y: Game.Arena.y / 2}, Game.Arena, 'purple')
    }
}
const Game = {
    Canvas:  null as HTMLCanvasElement        | null,
    Context: null as CanvasRenderingContext2D | null,

    Loop: null as Timer | null,

    time_frames: 0,
    time_ms:     0,

    Player: -1,

    Arena: {x: 200, y: 200},

    initialize: function () {
        Game.Canvas  = document.getElementById(CONFIG.DISPLAY_NAME) as HTMLCanvasElement;
        Game.Context = Game.Canvas.getContext("2d")                 as CanvasRenderingContext2D;

        Game.Canvas.width  = CONFIG.DISPLAY_WIDTH;
        Game.Canvas.height = CONFIG.DISPLAY_HEIGHT;

        Game.Context.fillStyle = "black";
        Game.Context.fillRect(0, 0, CONFIG.DISPLAY_WIDTH, CONFIG.DISPLAY_HEIGHT);

        Input.initialize();

        Game.Player = Player.create({ x: CONFIG.DISPLAY_WIDTH / 2, y: CONFIG.DISPLAY_HEIGHT / 2 });

        Game.Loop = setInterval(Game.update, 1000 / CONFIG.FPS);
    },
    update: function () {
        const player = Player.get(0);
        if (!player) { return false; }
        Display.clear();
        Arena.update();
        // Input
        Player.update();
        // Move the mosnters
        Monster.update();
        // Move the projectiles
        Projectile.update();
        // Draw player
        if (CONFIG.DEBUG_RENDERER) { Debug.update(); }

        if (CONFIG.DEBUG_PERFORMANCE) {
            const new_time_ms = performance.now();
            const delta_time_ms = new_time_ms - Game.time_ms;
            Display.draw_text(player.Position, `FPS: ${Math.round(1000 / delta_time_ms)}`);
            Game.time_ms = new_time_ms;
        }
        Game.time_frames++;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    Game.initialize();
});