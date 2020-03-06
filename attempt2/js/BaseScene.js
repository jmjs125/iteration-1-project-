class BaseScene extends Phaser.Scene {
    cursors;
    enemies;
    player;
    door;
    blocks = [];
    keys;
    haskey = false;


    constructor(config, tilesetImageURL, tilemapURL, tilesetItemsURL) {
        super(config);
        this.tilesetImageURL = tilesetImageURL;
        this.tilemapURL = tilemapURL;
        this.tilesetItemsURL = tilesetImageURL;

    }

    preload() {

        this.load.image('tileset-image', this.tilesetImageURL);
        this.load.image('mountains', '/assets/backgroundCastles.png');
        this.load.image("items", this.tilesetItemsURL);
        this.load.image('tilesets', this.tilesetItemsURL);
        this.load.image('doors', '/assets/door.png');
        this.load.image('bblocker', 'assets/block_exported.png');
        this.load.image('yblocker', 'assets/ylock_exported.png');
        this.load.image('gblocker', 'assets/glock_exported.png');
        this.load.image('keys', '/assets/greenkey.png');

        this.load.spritesheet('player', 'assets/wizard.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('enemy', 'assets/enemyblue.png', {
            frameHeight: 32,
            frameWidth: 32
        });



        this.load.tilemapTiledJSON('level', this.tilemapURL);
    }

    create() {
        this.map = this.make.tilemap({
            key: 'level'
        });
        this.keys = this.physics.add.staticGroup();
        this.enemies = this.physics.add.group();
        this.doors = this.physics.add.staticGroup();
        //this.block = this.physics.add.staticGroup();


        this.map.tileset = this.map.addTilesetImage('floor', 'tileset-image');

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.map.createStaticLayer('background', this.map.tileset, 0, 0);
        this.map.createStaticLayer('floor', this.map.tileset, 0, 0);

        //this.createplayer();

        let objectLayer = this.map.getObjectLayer("objects");
        if (objectLayer) {
            objectLayer.objects.forEach(function (object) {
                object = this.retrieveCustomProperties(object); //Check if the object has any custom properties in Tiled and assign them to the object
                // console.log(object)

                if (object.type === "spawnpoint") {
                    //Create player
                    this.createPlayer(object);
                } else if (object.type === "enemyspawner") {
                    this.createEnemy(object);
                    console.log('this is working');
                } else if (object.type === "blocker") {


                    this.blocks.push(object);




                } else if (object.type === "door") {

                    this.createdoors(object);



                } else if (object.type === "keys") {
                    this.createkey(object);
                    console.log(this.keys);

                }
            }, this); //Set context for object layer

        }
        for (var i = 0; i < this.blocks.length; i++) {
            this.createblockers(this.blocks[i]);

        }
        this.mountains = this.add.image(this.map.widthInPixels, this.map.heightInPixels, 'mountains');
        //console.log(this.mountains);
        this.mountains.setScale(10, 10);
        this.mountains.setDepth(-1);



        this.camera = this.cameras.getCamera("");
        this.camera.startFollow(this.player);
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.height * this.map.tileHeight);
        this.camera.zoom = 1;

        this.createCollision();
        this.cursors = this.input.keyboard.createCursorKeys()



        this.anims.create({
            key: 'Left',
            frames: this.anims.generateFrameNumbers('player', {
                start: 7,
                end: 9
            }),
            frameRate: 10,
            repeat: -1,

        });
        this.anims.create({
            key: 'Right',
            frames: this.anims.generateFrameNumbers('player', {
                start: 7,
                end: 8
            }),
            frameRate: 10,
            repeat: -1

        });


        this.anims.create({
            key: 'turn',
            frames: [{
                key: 'player',
                frame: 0
            }],
            frameRate: 10,
            repeat: -1
        })
       
      


    }

    update() {
        //console.log(this.player);
        if (this.cursors.right.isDown) {
            this.player.setVelocityX(250);
            this.player.flipX = false;
            this.player.anims.play('Right', true)
        } else if (this.cursors.left.isDown) {
            this.player.setVelocityX(-250);
            this.player.flipX = true;
            this.player.anims.play('Left', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn')
        }

        //Check for space bar press
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            this.player.setVelocityY(-500);
        }


    }
    createdoors(object) {

        this.doors.create(object.x, object.y, 'doors');
        //console.log(this.doors);


    }
    createblockers(object) {

        let name = object.name;


        let block = this.add.sprite(object.x, object.y, name);
        this.physics.add.existing(block);
        block.body.allowGravity = false;
        block.body.setImmovable(true);
        //this.physics.add.existing(block);
        //console.log(this.blocks);


        this.physics.add.collider(this.player, block, this.colliderblock, null, this);


    }
    createkey(object) {
        this.keys.create(object.x, object.y, 'keys');
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
        this.player.setCollideWorldBounds(true);
        this.player.setScale(1.5)
        this.player.setDepth(2)
    }


    createCollision() {
        // this is making a name and making = layer from tiled named 'floor' 
        //and tilesetImageURL = my ground.png image that is used to make floor
        let collisionLayer = this.map.getLayer('floor').tilemapLayer;

        collisionLayer.setCollisionBetween(0, 1000)


        this.physics.add.collider(this.player, collisionLayer);
        this.physics.add.collider(this.enemies, collisionLayer);
        this.physics.add.collider(this.enemies, this.player, this.enemyattack, null, this);
        this.physics.add.collider(this.player,this.keys,this.collidekey,null,this);


    }
    colliderblock() {
if(this.haskey == false ){
          console.log("door is lock ")
      }else if(this.haskey == true){
          console.log("player has key ")
      }
         



    }
    collidedoor() {
      
      

    }
    collidekey(){
      this.haskey = true;
      this.colliderblock();

        

        
    }
    enemyattack() {
        console.log("enemy hit you ");
    }
    createEnemy(object) {
        // //this.enemy = this.physics.add.sprite(object.x,object.y,'enemy',0);
        // this.enemy.setCollideWorldBounds(true);
        // this.enemy.setDepth(2)

        let origin = {
            x: object.x,
            y: object.y + object.height
        };
        let dest = {
            x: object.x + object.width,
            y: object.y + object.height
        };
        let line = new Phaser.Curves.Line(origin, dest);
        let enemy = this.add.follower(line, origin.x, origin.y, 'enemy');
        this.physics.add.existing(enemy);
        this.enemies.add(enemy);



        enemy.startFollow({
            duration: 5000,
            repeat: -1,
            yoyo: true,
            ease: 'Sine.easeInOut'
        })

    }
}