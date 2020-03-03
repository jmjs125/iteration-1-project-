class BaseScene extends Phaser.Scene{

    constructor(config, tilesetImageURL, tilemapURL) {
        super(config);
        this.tilesetImageURL = tilesetImageURL;
        this.tilemapURL = tilemapURL;
    }

    preload() {
        this.load.image('tileset-image', this.tilesetImageURL);
        
        this.load.spritesheet('player', 'assets/wizard.png', {
            frameWidth: 32,
            frameHeight: 32
        });


        this.load.tilemapTiledJSON('level', this.tilemapURL);
    }

    create() {
        this.map = this.make.tilemap({
            key: 'level'
        });

        this.map.tileset = this.map.addTilesetImage('floor', 'tileset-image');

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.map.createStaticLayer('background', this.map.tileset, 0, 0);
        this.map.createStaticLayer('floor', this.map.tileset, 0, 0);

        //this.createplayer();

        let objectLayer = this.map.getObjectLayer("objects");
        if (objectLayer) {
            objectLayer.objects.forEach(function (object) {
                object = this.retrieveCustomProperties(object); //Check if the object has any custom properties in Tiled and assign them to the object


                if (object.type === "spawnpoint") {
                    //Create player
                    this.createPlayer(object);
                }
            }, this); //Set context for object layer
        }

        this.camera = this.cameras.getCamera("");
        this.camera.startFollow(this.player);
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.height * this.map.tileHeight);
        this.camera.zoom = 1;




    }

    update() {
        //console.log(this.player);


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
    createPlayer(object) {
        this.player = this.physics.add.sprite(object.x, object.y, 'player', 0);

    }

}