import { game, world, graphics } from "../index.js";
export default Ship;

function Ship(hp, damage)
{
    this.isShip = true;

    this.hp = hp || 0;
    this.maxHp = this.hp;
    this.damage = damage || 1;

    this.drawHpBar = function()
    {
        if(this.hp * 100 / this.maxHp > 30)
        {
            // Green if hp is more than 30%
            graphics.fillStyle(0x33FF55, 0.8);
        }else{
            // Red if hp is less than (or equal to) 30%
            graphics.fillStyle(0xD32277, 0.8);
        }
        graphics.fillRect(this.x, this.y - 4, this.hp * this.width / this.maxHp, 3);
    };
    this.updateHp = function()
    {
        if(this.hp <= 0)
        {
            this.destroy();
        } 
    };

    this.draw = function()
    {
        this.drawHpBar();
    };
    
    // Need to be change in direction of heading.
    // or switch to matter.js instead.
    this.setVelocity = function(amt, max)
    {
        if(Math.pow(this.sprite.body.velocity.x, 2) + Math.pow(this.sprite.body.velocity.y, 2) < max * max)
        {
            var angle = this.sprite.rotation - Math.PI / 2;
            this.sprite.body.setVelocity(amt * Math.cos(angle), amt * Math.sin(angle));
        }
    };
}

world.factory.addArray("ship", Ship);