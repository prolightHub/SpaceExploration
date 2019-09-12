import { game, world, graphics } from "../index.js";
import Sprite from "./Sprite.js";

function Planet(x, y, radius)
{
    CartesianSystemLite.GameObjects.Circle.apply(this, arguments);
    Sprite.apply(this, arguments);

    this.setSprite = function()
    {
        this.createSprite("planet", "physics").setCircle(this.radius, 0, 0);//.setCircle(this.radius, -this.radius, -this.radius);

        // this.sprite.body.updateCenter();
        this.sprite.body.updateBounds();

        this.sprite.setVisible(false);
        this.sprite.setImmovable(true);

        var planet = this;
        this.sprite.onCollide = function(object1, object2)
        {
            // object2.body.setMaxVelocity(0, 0);
        };
    };

    this.setSprite();

    this.draw = function()
    {
        graphics.stroke(0xFFFFFFCC);
        graphics.strokeCircle(this.x, this.y, this.radius);
    };
}

world.factory.addArray("planet", Planet);