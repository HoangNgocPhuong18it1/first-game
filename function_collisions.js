const canvasWidth = 1000;
const canvasHeight = 500;
let gameObjects;
let canvas;
let context;
let secondsPassed = 0;
let oldTimeStamp = 0;
let movingSpeed = 50;
let rectX = 0;
let rectY = 0;
const g = 9.81;
const restitution = 0.90;
let img = document.getElementById("myImage");

window.onload = init;

function init(){
    // Get a reference to the canvas
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    createWorld();
    window.requestAnimationFrame(gameLoop);
}
function createWorld(){
    gameObjects = [
        new Circle(context, 250, 200, 10, 50 ,11),
        new Circle(context, 120, 150, 10, 60 ,7),
        new Circle(context, 170, 100, 20, 70 ,15),
        new Circle(context, 650, 50, 50, 50 ,20),
        new Circle(context, 250, 300, 10, -50 ,30),
        new Circle(context, 150, 0, 50, 50,10),
        new Circle(context, 250, 150, 50, 20,15),
        new Circle(context, 850, 75, -50, 10,17),
        new Circle(context, 900, 300, 10, -50,25),
        new Circle(context, 550, 111, 50,30,12),
        new Circle(context, 222, 79, 50, 20,10),
        new Circle(context, 700, 100, -20, 50,7),
        new Circle(context, 420, 331, 50, 22,10),
        new Circle(context, 650, 79, 23, 25,10),
        new Circle(context, 345, 100, -40, 10,17),
        new Circle(context, 150, 160, 20, 50 ,15),
        new Circle(context, 140, 150, 40, 5 ,20),
        new Circle(context, 350, 230, 10, -50 ,30),
        new Circle(context, 160, 610, 5, 50,10),
        new Circle(context, 550, 250, 50, 15,12),
        new Circle(context, 250, 745, -50, 26,7),
        new Circle(context, 310, 200, 14, -50,35),
        new Circle(context, 170, 511, 44, 22,15),
        new Circle(context, 122, 279, 14, 77,10),
        new Circle(context, 600, 200, -50, 23,7),
        new Circle(context, 220, 391, 23, 10,20),
        new Circle(context, 150, 279, 15, 55,10),
        new Circle(context, 325, 120, -50, 15,17),

        new Circle(context, 500, 300, 50, -50,15)
    ];
}

function gameLoop(timeStamp)
{
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;

    // Loop over all game objects
    for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].update(secondsPassed);
    }

    detectEdgeCollisions();
    detectCollisions();

    for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].clearCanvas();
    }

    // Do the same to draw
    for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].draw();
    }

    window.requestAnimationFrame(gameLoop);
}

class GameObject
{
    constructor (context, x, y, vx, vy, radius){
        this.context = context;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
       
        this.isColliding = false;
    }
}
class Circle extends GameObject
{   
    // Define the number of columns and rows in the sprite
    static numColumns = 5;
    static numRows = 2;
    static frameWidth = 0;
    static frameHeight = 0;
    static sprite;

    constructor (context, x, y, vx, vy,radius){
        super(context, x, y, vx, vy,radius);
        // Set default width and height
        this.mass = this.radius/2;
        this.degreesold = 180 *(Math.atan2(this.vy, this.vx))/ Math.PI
        this.restitution2 = 1.1; 
    }
    draw(){
        // // Draw a simple Circle
        // this.context.fillStyle = this.isColliding?'#ff8080':'#0099b0';
        // this.context.beginPath();
        // // this.context.fillRect(this.x, this.y, this.width, this.height);
        // this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        // this.context.fill();
        this.context.drawImage(img, this.x - this.radius*1.2, this.y - this.radius * 1.1, this.radius * 2.5, this.radius * 2.62);
        // this.context.beginPath();
        // this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        // context.strokeStyle = '#0099b0';
        // context.stroke();
        
    }
   

    update(secondsPassed){
        // Move with set velocity
        this.vy += g * secondsPassed;
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;
        // Calculate the angle (vy before vx)
        let radians = Math.atan2(this.vy, this.vx);
        // Convert to degrees
        let degrees = 180 * radians / Math.PI;
        // console.log("số:",degrees)
    }
    clearCanvas(){
        this.context.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function detectCollisions(){
    let obj1;
    let obj2;

    // Reset collision state of all objects
    for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].isColliding = false;
    }

    // Start checking for collisions
    for (let i = 0; i < gameObjects.length; i++)
    {
        obj1 = gameObjects[i];
        for (let j = i + 1; j < gameObjects.length; j++)
        {
            obj2 = gameObjects[j];

            // Compare object1 with object2
            if (circleIntersect(obj1.x, obj1.y, obj1.radius, obj2.x, obj2.y, obj2.radius)){
                let vCollision = {x: obj2.x - obj1.x, y: obj2.y - obj1.y};
                let distance = Math.sqrt((obj2.x-obj1.x)*(obj2.x-obj1.x) + (obj2.y-obj1.y)*(obj2.y-obj1.y));
                let vCollisionNorm = {x: vCollision.x / distance, y: vCollision.y / distance};
                let vRelativeVelocity = {x: obj1.vx - obj2.vx, y: obj1.vy - obj2.vy};
                let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
                speed *= Math.min(obj1.restitution2, obj2.restitution2);
                if (speed < 0){
                    break;
                }
                
                let impulse = 2 * speed / (obj1.mass + obj2.mass);
                obj1.vx -= (impulse * obj2.mass * vCollisionNorm.x);
                obj1.vy -= (impulse * obj2.mass * vCollisionNorm.y);
                obj2.vx += (impulse * obj1.mass * vCollisionNorm.x);
                obj2.vy += (impulse * obj1.mass * vCollisionNorm.y);
                obj1.isColliding = true;
                obj2.isColliding = true;
            }
        }
    }
}
function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    // Check x and y for overlap
    if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2){
        return false;
    }
    return true;
}
function circleIntersect(x1, y1, r1, x2, y2, r2) {

    // Calculate the distance between the two circles
    let CircleDistance = (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2);

    // When the distance is smaller or equal to the sum
    // of the two radius, the circles touch or overlap
    return CircleDistance <= ((r1 + r2) * (r1 + r2))
}

function detectEdgeCollisions()
 {
     let obj;
     for (let i = 0; i < gameObjects.length; i++)
     {
         obj = gameObjects[i];

         // Check for left and right
         if (obj.x < obj.radius){
             obj.vx = Math.abs(obj.vx) * restitution;
             obj.x = obj.radius;
         }else if (obj.x > canvasWidth - obj.radius){
             obj.vx = -Math.abs(obj.vx) * restitution;
             obj.x = canvasWidth - obj.radius;
         }

         // Check for bottom and top
         if (obj.y < obj.radius){
             obj.vy = Math.abs(obj.vy) * restitution;
             obj.y = obj.radius;
         } else if (obj.y > canvasHeight - obj.radius){
             obj.vy = -Math.abs(obj.vy) * restitution;
             obj.y = canvasHeight - obj.radius;
         }
     }
}