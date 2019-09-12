import { game, world, graphics } from "../index.js";
export default Sprite;

var scene = game.scene.scenes[0];

function Sprite(x, y)
{
    this.body.physics.moves = true;

    this.createSprite = function(name, prop)
    {
        if(prop)
        {
            this.sprite = scene[prop].add.sprite(x, y, name);
            this.sprite.body.setCollideWorldBounds(true);
        }else{
            this.sprite = scene.add.sprite(x, y, name);
        }

        this.sprite._container = this;

        this.sprite.isGameObject = true;

        return this.sprite;
    };

    this.setup = function()
    {
        this.sprite._arrayName = this._arrayName;
    };

    this.draw = function()
    {
        graphics.lineStyle(1, 0xFFFFFF, 1.0);
        graphics.strokeRect(this.x, this.y, this.width, this.height);
    };

    this.setSprite = this.createSprite;

    var _lastDestroy = this.destroy;
    this.destroy = function()
    { 
        this.sprite.destroy();

        _lastDestroy.apply(this, arguments);
    };

    this.setSize = function(width, height)
    {
        this.sprite.setDisplaySize(width, height);

        this.width = width;
        this.height = height;

        if(this.sprite.body)
        {
            this.sprite.body.updateBounds();
        }

        return this;
    };

    this.updatePosition = function()
    {
        var obj = (this.sprite.body || this.sprite);
        this.x = obj.x + (obj.radius || 0);
        this.y = obj.y + (obj.radius || 0);

        this.body.updateBoundingBox();
    };

    this.update = function()
    {
        this.updatePosition();
    };

    this.onCollide = function() {};
}

world.factory.addArray("sprite", Sprite);