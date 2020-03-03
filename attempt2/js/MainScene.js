class FirstScene extends Phaser.Scene {

        constructor(config) {
            super(config);
        }

        preload() {
            console.log('tileset')
            this.load.image('tileset-image', 'assets/spritesheet_ground.png');
            this.load.spritesheet('player', 'assets/wizard.png', {
                frameWidth: 32,
                frameHeight: 32
            });


            this.load.tilemapTiledJSON('level', 'assets/level.json');
        }

        create() {
            this.map = this.make.tilemap({
                key: 'level'
            });

            this.map.tileset = this.map.addTilesetImage('floor', 'tileset-image');
            console.log(this.map.tileset);


            this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

            this.map.createStaticLayer('floor', this.map.tileset, 0, 0);
            this.map.createStaticLayer('background', this.map.tileset, 0, 0);

            this.createplayer();

            let objectLayer = this.map.getObjectLayer("Objects");

            if (objectLayer) {
                objectLayer.objects.forEach(function (object) {
                    object = this.retrieveCustomProperties(object); //Check if the object has any custom properties in Tiled and assign them to the object
    
                    if (object.type === "spawnpoint") {
                        //Create player
                        this.createPlayer(object);
                    }  
                }, this); //Set context for object layer
            }

          


            }

            update() {
                console.log(player);


            }

            retrieveCustomProperties(object) {
                if (object.properties) { //Check if the object has custom properties
                    if (Array.isArray(object.properties)) { //Check if from Tiled v1.3 and above
                        object.properties.forEach(function (element) { //Loop through each property
                            this[element.name] = element.value; //Create the property in the object
                        }, object); //Assign the word "this" to refer to the object
                    } else { //Check if from Tiled v1.2.5 and below
                        for (var propName in object.properties) { //Loop through each property
                            object[propName] = object.properties[propName]; //Create the property in the object
                        }
                    }
        
                    delete object.properties; //Delete the custom properties array from the object
                }
        
                return object; //Return the new object w/ custom properties
            }
            createplayer(object) {
                this.player = this.physics.add.sprite(object.x, object.y, 'player', 0);

            }


        }