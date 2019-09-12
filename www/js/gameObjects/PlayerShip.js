import { game, world, graphics } from "../index.js";
import Sprite from "./Sprite.js";
import Ship from "./Ship.js";

var scene = game.scene.scenes[0];

function PlayerShip(x, y, width, height)
{
    CartesianSystemLite.GameObjects.Rect.apply(this, arguments);
    Sprite.apply(this, arguments);
    Ship.call(this, 10);

    this.setSprite = function()
    {
        this.createSprite("playerShip", "physics").setDrag(200, 200).setAngularDrag(140).setMaxVelocity(430, 430);

        scene.anims.create({
            key: "full",
            frames: [
            {
                key: "playerShip"
            }],
            frameRate: 1,
            repeat: -1
        });
        scene.anims.create({
            key: "slow",
            frames: [
            {
                key: "playerShip2"
            }],
            frameRate: 1,
            repeat: -1
        });

        this.setSize(width, height);
    };

    this.setSprite();

    this.update = function()
    {
        if(scene.keys.left.isDown || scene.keys.a.isDown)
        {
            this.sprite.setAngularVelocity(-150);
        }
        else if(scene.keys.right.isDown || scene.keys.d.isDown)
        {
            this.sprite.setAngularVelocity(150);
        }else{
            this.sprite.setAngularVelocity(0);
        }

        if(scene.keys.up.isDown || scene.keys.w.isDown)
        {
            this.setVelocity(230, 230);          
        }
        else if(scene.keys.down.isDown || scene.keys.s.isDown)
        {
            this.setVelocity(-150, -150);          
        }else{
            this.sprite.setAcceleration(0);
        }

        var speed = Math.pow(this.sprite.body.velocity.x, 2) + Math.pow(this.sprite.body.velocity.y, 2);

        // Update booster animation
        if(speed > 200 * 200)
        {
            this.sprite.anims.play("full");
        }else{
            this.sprite.anims.play("slow");
        }

        if(scene.keys.space.isDown)
        {
            this.fire(500);
        }

        this.sprite.setMaxVelocity(430, 430);

        this.updatePosition();
    };

    this.lastFireTime = 0;
    this.fire = function(time)
    {
        if(performance.now() - this.lastFireTime < time)
        {
            return;
        }

        // Fire right
        var a = this.sprite.rotation - Math.PI / 4;

        var bullet = world.factory.add("bullet", 
        this.sprite.x + Math.cos(a) * 33, 
        this.sprite.y + Math.sin(a) * 33, 2.5, 0x22BA34, 
        {
            rotation: this.sprite.rotation - Math.PI / 2,
            speed: 420
        });

        bullet.damage = this.damage;
        bullet.shooter = this;
        bullet.targets = ["enemyShip"];

        // Fire left
        a -= Math.PI / 2;

        var bullet = world.factory.add("bullet", 
        this.sprite.x + Math.cos(a) * 33, 
        this.sprite.y + Math.sin(a) * 33, 2.5, 0x22BA34, 
        {
            rotation: this.sprite.rotation - Math.PI / 2,
            speed: 420
        });

        bullet.damage = this.damage;
        bullet.shooter = this;
        bullet.targets = ["enemyShip"];

        this.lastFireTime = performance.now();
    };
}

world.factory.addArray("playerShip", PlayerShip);