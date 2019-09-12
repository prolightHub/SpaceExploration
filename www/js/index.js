export { game, world, graphics, messages, background, pointer };

var config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 480,
    scene: {
        preload: preload,
        create: create,
        update: update,
        render: render,

        physics: {
            // default: "arcade",
            arcade: {
                gravity: { y: 0, x: 0 }
            },
        }
    },
    backgroundColor: "rgba(0, 0, 0)",
    
    csl: {
        level: {
            x: 0,
            y: 0,
            width: 340 * 16,
            height: 340 * 16
        },
        camera: {
            x: 0,
            y: 0,
            width: 800,
            height: 480
        },
        cameraGrid: {
            cellWidth: 340,
            cellHeight: 340,
            useCellCache: true
        }
    }
};

var game = new Phaser.Game(config);
var world = new CartesianSystemLite(config.csl);

window.game = game;
window.world = world;

var graphics, screen, background, playerShip;

var pointer = {
    x: 0,
    y: 0
},
messages = {};

function preload() 
{
    this.load.image("playerShip", "/assets/images/PlayerShip.png");
    this.load.image("playerShip2", "/assets/images/PlayerShip2.png");
    this.load.image("enemyShip", "/assets/images/EnemyShip.png");
    this.load.image("enemyShip2", "/assets/images/EnemyShip2.png");
}

function create()
{
    graphics = this.add.graphics();

    background = this.add.graphics();
    background.before = true;

    screen = this.add.graphics().setScrollFactor(0);
    screen.lineStyle(1, 0xFFFFFF, 0.4);
    screen.strokeRect(world.camera.x, world.camera.y, world.camera.width, world.camera.height);

    addStars();

    var rect = world.level;
    this.physics.world.setBounds(rect.x, rect.y, rect.width, rect.height);

    playerShip = world.factory.add("playerShip", rect.x + rect.width / 2, rect.y + rect.height / 2, 64, 64);
    window.ship = playerShip;

    var bounds = world.level.bounds;

    for(var i = 0; i < 50; i++)
    {
        world.factory.add("enemyShip", 
            Phaser.Math.Between(bounds.minX, bounds.maxX), 
            Phaser.Math.Between(bounds.minY, bounds.maxY), 64, 64);
    }

    for(var i = 0; i < 45; i++)
    {
        world.factory.add("planet", 
            Phaser.Math.Between(bounds.minX, bounds.maxX), 
            Phaser.Math.Between(bounds.minY, bounds.maxY), Phaser.Math.Between(45, 200));
    }

    world.factory.add("enemyShip", rect.x + rect.width / 2 + 160, rect.y + rect.height / 2, 64, 64).state = "runAway";

    this.cameras.main.startFollow(playerShip.sprite);
    this.cameras.main.setBounds(rect.x, rect.y, rect.width, rect.height);

    const { LEFT, RIGHT, UP, DOWN, W, A, S, D, SPACE, X } = Phaser.Input.Keyboard.KeyCodes;
    this.keys = this.input.keyboard.addKeys({
        space: SPACE,
        left: LEFT,
        right: RIGHT,
        up: UP,
        down: DOWN,
        w: W,
        a: A,
        s: S,
        d: D,
        x: X
    });

    this.input.on("pointermove", function(p)
    {
        pointer.x = p.x;
        pointer.y = p.y;
    });

    this.input.on("pointerdown", function(p)
    {
        pointer.leftDown = p.leftButtonDown();
        pointer.rightDown = p.rightButtonDown();
    });

    this.input.on("pointerup", function(p)
    {
        pointer.leftDown = false;
        pointer.rightDown = false;
    });
    
    messages.position = this.add.text(10, 10, 'x: 0, y: 0',
    {
        fontSize: '12px',
        fill: '#ffffffbb'
    }).setScrollFactor(0);

    messages.place = this.add.text(10, 170, '0, 0', 
    {
        fontSize: '12px',
        fill: '#ffffffbb',
    }).setScrollFactor(0);

    integration.getObjects(this, world);
}

function update(time, delta)
{
    graphics.clear();
    background.clear();

    world.camera.view(
        playerShip.sprite.body.x + playerShip.sprite.body.halfWidth, 
        playerShip.sprite.body.y + playerShip.sprite.body.halfHeight);

    world.gameObjects.window(false, 2);
    world.gameObjects.update();

    world.gameObjects.window();
    world.gameObjects.draw();
    drawStars();

    integration.applyObjects(this, world, game);
    debug(time, delta);
}

function render()
{   
    
}

// Prevent right click menu from showing because it is annoying
document.addEventListener('contextmenu', event => event.preventDefault());


function debug(time, delta)
{
    messages.position.setText("x: " + playerShip.x.toFixed(0) + " y: " + playerShip.y.toFixed(0) + " fps: " + (1000 / delta).toFixed(2));

    if(!pointer.rightDown)
    {
        messages.place.setText("");
        return;
    }

    graphics.lineStyle(1, 0xFFFFFF, 0.4);

    var width = world.cameraGrid.cellWidth,
        height = world.cameraGrid.cellHeight;

    var col, row;

    var left = world.camera._upperLeft.col, right = world.camera._lowerRight.col,
        up = world.camera._upperLeft.row, down = world.camera._lowerRight.row;

    for(col = left; col <= right; col++)
    {
        for(row = up; row <= down; row++)
        {
            graphics.strokeRect(col * width, row * height, width, height);  
        }
    }

    var cam = world.camera;
    var place = world.cameraGrid.getPlace(
        cam.body.boundingBox.minX + pointer.x - cam.x, 
        cam.body.boundingBox.minY + pointer.y - cam.y);

    var cell = world.cameraGrid[place.col][place.row];

    var str = "";
    for(var i in cell)
    {
        str += i + '\n';
    }
    messages.place.setText(place.col + ", " + place.row + "\n" + str);
}

function addStars()
{
    var bounds = world.level.bounds;

    var width = world.cameraGrid.cellWidth,
        height = world.cameraGrid.cellHeight;

    var col, row, stars, i;

    var left = world.cameraGrid.minCol, right = world.cameraGrid.maxCol,
        up = world.cameraGrid.minRow, down = world.cameraGrid.maxRow;

    for(col = left; col <= right; col++)
    {
        for(row = up; row <= down; row++)
        {
            stars = [];

            for(i = 0; i < Phaser.Math.Between(20, 34); i++)
            {
                stars.push({
                    x: bounds.minX + width * col + width * Math.random(),
                    y: bounds.minY + height * row + height * Math.random(),
                    color: new Phaser.Display.Color(255, 255, 255, 230),
                    size: Math.random() < 0.6 ? 1 : 2
                });
            }

            world.cameraGrid[col][row].cache.stars = stars;
        }
    }
}
function drawStars()
{
    var col, row, stars, i;

    var left = world.camera._upperLeft.col, right = world.camera._lowerRight.col,
        up = world.camera._upperLeft.row, down = world.camera._lowerRight.row;

    for(col = left; col <= right; col++)
    {
        for(row = up; row <= down; row++)
        {
            stars = world.cameraGrid[col][row].cache.stars;

            for(i = 0; i < stars.length; i++)
            {
                background.fillStyle(stars[i].color.color32, stars[i].color.alphaGL);
                background.fillPoint(stars[i].x, stars[i].y, stars[i].size);
            }
        }
    }
}

window.playerShip = playerShip;