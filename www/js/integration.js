/*
    The integration object integrates a Phaser 3 scene with an instance of the Cartesian System Engine.

    * This is a highly exprimental part of the code!
    * Changes to suit our needs all the time.
*/

var integration = {

    displayList: [],
    updateList: [],
    bodies: [],
    colliders: [],

    getObjects: function(scene, world)
    {
        this.updateList = [];

        scene.sys.updateList._list.forEach(function(element)
        {
            if(!element.isGameObject)
            {
                integration.updateList.push(element);
            }
        });

        this.displayList = [];

        scene.sys.displayList.list.forEach(function(element)
        {
            if(!element.isGameObject)
            {
                integration.displayList.push(element);
            }
        });

        this.bodies = [];
        this.colliders = [];
    },
    applyObjects: function(scene, world, game)
    {
        // This task is simple:
        // Make sure to only use what sprites are on screen.
        // We still have to manually add everything else though.

        var updateList = scene.sys.updateList._list;
        updateList.length = 0;

        var displayList = scene.sys.displayList.list;
        displayList.length = 0;

        // var bodies = scene.physics.world.bodies.entries;

        // bodies.length = 0;

        scene.physics.world.bodies.clear();

        // scene.physics.world.colliders._pending.length = 0;
        // scene.physics.world.colliders._active.length = 0;
        // scene.physics.world.colliders._destroy.length = 0;
       
        scene.physics.world.colliders.destroy();

        world.gameObjects.eachObjectsInCamera(function(object)
        {
            if(!object.sprite)
            {
                return;
            }
            
            // Update
            updateList.push(object.sprite);

            // Display
            if(object.sprite.visible)
            {
                displayList.push(object.sprite);
            }

            if(object.sprite.body)
            {
                // Update physics
                // bodies.push(object.sprite.body);

                scene.physics.world.add(object.sprite.body);

                // Add colliders
                var k, l;
                var array = world.gameObjects;
                var used = array.used;

                for(k in used)
                {
                    for(l = 0; l < used[k].length; l++)
                    {
                        scene.physics.world.addCollider(object.sprite, array[k][used[k][l]].sprite, object.sprite.onCollide, null, scene);
                    }
                }
            }
        });

        for(var i = 0; i < this.updateList.length; i++)
        {
            updateList.push(this.updateList[i]);
        }

        for(var i = 0; i < this.displayList.length; i++)
        {
            if(this.displayList[i].before)
            {
                displayList.unshift(this.displayList[i]);
            }else{
                displayList.push(this.displayList[i]);
            }
        }   
    }
};