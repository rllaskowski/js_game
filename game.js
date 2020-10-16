const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");


class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}

const drawRect = (x, y, width, height, color) => {
    ctx.beginPath();
    ctx.rect(x, canvas.height-y-height, width, height);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

const drawCircle = (x, y, radius, color) => {
    ctx.beginPath();
    ctx.arc(x, canvas.height-y-radius, radius, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

const getRectBox = (x, y, width, height, dx, dy) => {
    return {
        x: x,
        y: y,
        width: width,
    }
}

class Entity {
    constructor(x, y) {
        
    }
    
    draw() {
        drawRect(x, y, 50, 50, "#000000");
    }


    getCollisionBox() {
        getRectBox(this.x, this.y, this.width, this.height, this.dx, this.dy);
    }


    setVelocity(dx, dy) {
        this.dx = dx;
        this.dy = dy;
    }


}

const checkColision


const circle = new Circle(100, 400, 20, "#FFFFFF");
const rect = new Rect(100, 0, 100, 100, "#000000");


let dx = 0;
let dy = 0;

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    circle.draw(ctx);
    rect.draw(ctx);
    
    circle.move(dx, dy);

    dy -= 0.05;
    
}

setInterval(draw, 10)

