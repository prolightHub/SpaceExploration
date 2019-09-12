import { game, world, background } from "../index.js";
import Sprite from "./Sprite.js";

var NOOP = CartesianSystemLite.Tweens.NOOP;
var scene = game.scene.scenes[0];

function Bullet(x, y, diameter, color, config) 
{
    CartesianSystemLite.GameObjects.Circle.apply(this, arguments);
    Sprite.apply(this, arguments);
    
    this.color = color;

    this.velocity = {
        x: 0,
        y: 0
    };

    this.life = 160;
    this.damage = 1;

    if(config)
    {
        this.velocity.x = Math.cos(config.rotation) * config.speed;
        this.velocity.y = Math.sin(config.rotation) * config.speed;

        this.life = config.life || this.life;
        this.damage = config.damage || this.damage;
    }

    this.inflictDamage = function(object)
    {
        object.hp -= this.damage;
    };

    this.setSprite = function()
    {
        this.createSprite("bullet", "physics").setVisible(false).setMaxVelocity(800, 800);
        this.setSize(this.diameter, this.diameter);

        this.sprite.setCollideWorldBounds(false);

        this.sprite.rotation = config.rotation;
        this.sprite._isBullet = true;

        var bullet = this;
        this.sprite.onCollide = function(object1, object2)
        {
            object2 = object2._container;

            if(object2._arrayName !== bullet.shooter._arrayName &&
              (!bullet.targets || bullet.targets.indexOf(object2._arrayName) !== -1) && 
              object2.isShip)
            {
                bullet.inflictDamage(object2);
                bullet.destroy();

                object2.updateHp();
            }

            object2.onCollide(bullet);    
        };
    };

    this.setSprite();

    this.draw = function()
    {
        background.fillStyle(this.color || 0xBB3322);
        background.fillRect(this.x, this.y, this.diameter, this.diameter);
    };

    this.update = function()
    {
        this.updatePosition();

        this.sprite.setVelocity(this.velocity.x, this.velocity.y);

        this.life -= 1;

        if(this.life < 0)
        {
            this.destroy();
        }
    };
}

world.factory.addArray("bullet", Bullet);