import { game, world } from "../index.js";
import Sprite from "./Sprite.js";
import Ship from "./Ship.js";

let NOOP = CartesianSystemLite.Tweens.NOOP;
let resolveAngle = CartesianSystemLite.Tweens.Angle.resolveAngle;

const DEG_TO_RAD = Phaser.Math.DEG_TO_RAD;

var scene = game.scene.scenes[0];
var angleMath = Phaser.Math.Angle;

function EnemyShip(x, y, width, height)
{
    CartesianSystemLite.GameObjects.Rect.apply(this, arguments);
    Sprite.apply(this, arguments);
    Ship.call(this, 10);

    // Important to have a time offset to make sure 
    // all AI events of all EnemyShips don't fire at the same time
    // otherwise that would cause frame cycling which we don't want. 
    const TIME_OFFSET = Phaser.Math.Between(-500, 500);
    const OFFSET_ANGLE = 100 * DEG_TO_RAD;
    const SIGHT_ANGLE = 20 * DEG_TO_RAD;
    const SIGHT_DISTANCE = 500 * 500;
    // Distance when needing to move away from other ships
    const MOVE_DISTANCE = 100 * 100;

    var enemyShip = this;

    this.setSprite = function()
    {
        this.createSprite("enemyShip", "physics").setDrag(200, 200).setMaxVelocity(200, 200);

        this.setSize(width, height);

        this.sprite.angle = Phaser.Math.Between(0, 360);
    };

    this.setSprite();

    this.controllers = {
        moving: true,
        aimless_left: {
            active: false,
            lastChangeTime: 0,
            changeInterval: 200,
            closeCondition: function()
            {
                return true;
            },
            onClose: function()
            {
                // How long until next position change?
                this.changeInterval = Phaser.Math.Between(500, 1200);
            },
            openCondition: function()
            {
                return Phaser.Math.Between(1, 300) < 20 && !enemyShip.controls.right();
            },
            onOpen: function()
            {
                // How long are we holding down left controller
                this.changeInterval = Phaser.Math.Between(300, 700);
            }
        },
        aimless_right: {
            active: false,
            lastChangeTime: 0,
            changeInterval: 200, 
            closeCondition: function()
            {
                return true;
            },
            onClose: function()
            {
                // How long until next position change?
                this.changeInterval = Phaser.Math.Between(500, 1200);
            },
            openCondition: function()
            {
                return Phaser.Math.Between(1, 300) < 20 && !enemyShip.controls.left();
            },
            onOpen: function()
            {
                // How long are we holding down right controller
                this.changeInterval = Phaser.Math.Between(300, 700);
            }
        },

        runAway_left: {
            active: false,
            lastChangeTime: 0,
            changeInterval: 1,
            closeCondition: function()
            {
                return true;
            },
            openCondition: function()
            {
                if(enemyShip.nearHit_choose === "left" && enemyShip.nearHit_angle !== undefined && scene.sys.time.now + TIME_OFFSET - enemyShip.nearHit_time < 1000)
                {
                    return Math.abs(enemyShip.sprite.angle - resolveAngle(enemyShip.nearHit_angle - 90)) > 40;
                }
            }
        },
        runAway_right: {
            active: false,
            lastChangeTime: 0,
            changeInterval: 1, 
            closeCondition: function()
            {
                return true;   
            },
            openCondition: function()
            {
                if(enemyShip.nearHit_choose === "right" && enemyShip.nearHit_angle !== undefined && scene.sys.time.now + TIME_OFFSET - enemyShip.nearHit_time < 1000)
                {
                    return Math.abs(enemyShip.sprite.angle - resolveAngle(enemyShip.nearHit_angle + 90)) > 40;
                }
            }
        },

        move_left: {
            active: false,
            lastChangeTime: 0,
            changeInterval: 1, 
            closeCondition: function()
            {
                return true;   
            },
            openCondition: function()
            {
                return enemyShip.pick_move === "left";
            }
        },
        move_right: {
            active: false,
            lastChangeTime: 0,
            changeInterval: 1, 
            closeCondition: function()
            {
                return true;   
            },
            openCondition: function()
            {
                return enemyShip.pick_move === "right";
            }
        }
    };

    this.updatePiece = function(piece)
    {
        if(scene.sys.time.now + TIME_OFFSET - piece.lastChangeTime > piece.changeInterval)
        {
            if(piece.active && (piece.closeCondition || NOOP)())
            {
                (piece.onClose || NOOP).apply(piece);
                piece.active = false;
            }
            if(!piece.active && (piece.openCondition || NOOP)())
            {
                (piece.onOpen || NOOP).apply(piece); 
                piece.active = true;
            }

            piece.lastChangeTime = scene.sys.time.now + TIME_OFFSET;
        }
    };

    this.controls = {
        left: function()
        {
            return enemyShip.controllers[enemyShip.state + "_left"].active;
        },
        right: function()
        {
            return enemyShip.controllers[enemyShip.state + "_right"].active;
        },
        up: function()
        {
            return enemyShip.controllers.moving;
        }
    };

    this.state = "aimless";

    this.states = {
        "aimless": function()
        {
            this.updatePiece(this.controllers.aimless_left);
            this.updatePiece(this.controllers.aimless_right);

            var bullet = this.getClosestBullet();
            if(bullet)
            {
                this.nearHit_time = scene.sys.time.now + TIME_OFFSET;
                this.nearHit_angle = Math.atan(bullet.velocity.y, bullet.velocity.x) * Phaser.Math.RAD_TO_DEG;
                this.nearHit_choose = (Math.random() < 0.5) ? "left" : "right";

                this.state = "runAway";
            }
        },
        "runAway": function()
        {
            this.updatePiece(this.controllers.runAway_left);
            this.updatePiece(this.controllers.runAway_right);

            if(scene.sys.time.now + TIME_OFFSET - this.nearHit_time > 10000)
            {
                this.nearHit_time = undefined;
                this.nearHit_angle = undefined;
                this.nearHit_choose = undefined;

                this.state = "aimless";
            }
        },
        "move": function()
        {
            this.updatePiece(this.controllers.move_left);
            this.updatePiece(this.controllers.move_right);

            if(scene.sys.time.now + TIME_OFFSET - this.avoid_start > 600)
            {
                this.pick_move = undefined;
                this.avoid_object = undefined;
                this.state = "aimless";
            }
        }
    };

    var stateText = scene.add.text("State", this.x, this.y, 
    {
        fontSize: '11px',
    });

    var _lastDraw = this.draw;
    this.draw = function()
    {
        _lastDraw.apply(this, arguments);
        stateText.setText(this.state);
        stateText.y = this.y - 20;
        stateText.x = this.x;
    };

    this.update = function()
    {
        this.setVelocity(230, 230); 

        if(this.controls.left())
        {
            this.sprite.setAngularVelocity(-150);
        }
        else if(this.controls.right())
        {
            this.sprite.setAngularVelocity(150);
        }else{
            this.sprite.setAngularVelocity(0);
        }

        if(this.controls.up())
        {
            this.setVelocity(100, 100);          
        }else{
            this.sprite.setAcceleration(0);
        }

        this.updatePosition();
        this.updateHp();

        this.states[this.state].apply(this, []);

        if(scene.sys.time.now + TIME_OFFSET - this.lastFireTime > 400 && this.isTargetInRange())
        {
            this.fire();
            this.lastFireTime = scene.sys.time.now + TIME_OFFSET;
        }

        if(this.avoid_object && this.state !== "move" && scene.sys.time.now + TIME_OFFSET - this.avoid_start > 200)
        {
            var angle = angleMath.Normalize((this.sprite.angle - 90) * Phaser.Math.DEG_TO_RAD);
            var betweenAngle = angleMath.Normalize(angleMath.Between(this.avoid_object.x, this.avoid_object.y, this.sprite.x, this.sprite.y))

            this.pick_move = (angle > betweenAngle) ? "left" : "right";
            this.avoid_start = scene.sys.time.now + TIME_OFFSET;
            this.state = "move";
        }
    };
    this.avoid_start = 0;

    this.onCollide = function(object)
    {
        if(object._arrayName === "bullet" && object.shooter._arrayName !== this.arrayName)
        {
            this.state = "runAway";
        }
    };

    this.lastFireTime = scene.sys.time.now + TIME_OFFSET;

    this.fire = function()
    {
        var bullet = world.factory.add("bullet", 
        this.sprite.x, 
        this.sprite.y, 2.6, 0x3D71CF, 
        {
            rotation: this.sprite.rotation - Math.PI / 2,
            speed: 350
        });

        bullet.damage = this.damage;
        bullet.shooter = this;
        bullet.targets = ["playerShip"];
    };

    this.isTargetInRange = function()
    {
        var angle = angleMath.Normalize((this.sprite.angle + 90) * Phaser.Math.DEG_TO_RAD);
        var dist;

        return world.gameObjects.cutLoopThrough(
            this._upperLeft.col, this._lowerRight.col, this._upperLeft.row, this._lowerRight.row, 
            (object, index, array, place) =>
        {
            object = object.sprite;
            // Is a ship
            if(object.body && object._container.isShip &&
                
                // Within range
                (dist = Math.pow(object.x - this.sprite.x, 2) + 
                        Math.pow(object.y - this.sprite.y, 2)) < SIGHT_DISTANCE && 

                // Interject a lambda into an if statement, crazy
                (() => 
                {
                    // Do we need to move out of the way?
                    if(!this.avoid_object && dist < MOVE_DISTANCE && 
                        (this._id !== place.id || this._arrayName !== place.arrayName))
                    {
                        this.avoid_object = object._container;
                    }

                    // Not our own array
                    return object._arrayName !== this._arrayName && 
                     
                    // Infront of us
                    Math.abs(angle - angleMath.Normalize(angleMath.Between(
                    object.x, object.y, this.sprite.x, this.sprite.y))) < SIGHT_ANGLE; 
                })())
            {
                return true;
            }
        });
    };

    this.getClosestBullet = function()
    {
        var dist, set_place;
        var closest = Infinity;

        var col, row, i, place, object;

        for(col = this._upperLeft.col; col < this._lowerRight.col; col++)
        {
            for(row = this._upperLeft.row; row < this._lowerRight.row; row++)
            {
                for(i in world.cameraGrid[col][row])
                {
                    place = world.cameraGrid[col][row][i];
                    object = world.gameObjects[world.gameObjects.references[place.arrayName]][place.id].sprite;

                    if(object.body && object._arrayName === "bullet" && 
                        object._container.shooter._arrayName !== this._arrayName && 
                        
                        // Is it in range?
                        (dist = Math.pow(object.x - this.sprite.x, 2) + 
                        Math.pow(object.y - this.sprite.y, 2)) < SIGHT_DISTANCE && 

                        // With-in range?
                        closest > dist && 

                        // Is it that bullet within the rotation?
                        Math.abs(object.rotation - angleMath.Normalize(angleMath.Between(
                        object.x, object.y, this.sprite.x, this.sprite.y))) < OFFSET_ANGLE)
                    {
                        closest = dist;
                        set_place = place;
                    }
                }
            }
        }

        if(set_place)
        {
            return world.factory.get(set_place.arrayName, set_place.id);
        }
    };
}

world.factory.addArray("enemyShip", EnemyShip);