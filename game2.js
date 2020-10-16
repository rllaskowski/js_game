const canvas = document.getElementById("myCanvas");
const sickText = document.getElementById("sick-text");

const ctx = canvas.getContext("2d");

const ethanImage = new Image();
ethanImage.src = "./ethan.png";

const coughImage = new Image(); 
coughImage.src = "./cough.png";

const drawCircle = (coords, radius, color) => {
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, radius, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

const drawEmptyCircle = (coords, radius) => {
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, radius, 0, Math.PI*2);
    ctx.stroke();
}

const rand = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}


document.onmousemove = evt => {
    mousePos = getMousePos(canvas, evt);
}

let difficulity = 1.2;

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getDistance(vector) {
        const dx = this.x-vector.x;
        const dy = this.y-vector.y;
    
        return Math.sqrt(dx*dx+dy*dy);
    }

    getAngle = (v1, v2) => {
        return Math.atan2(v1.y-this.y, v1.x-this.x) - Math.atan2(v2.y-this.y, v2.x-this.x);
    }

    moveInDir(vector, dist) {
        const x = vector.x;
        const y = vector.y;

        if (x != this.x) {
            const dir = Math.abs((y-this.y)/(x-this.x));

            this.x += Math.sqrt(dist/(dir*dir+1)) * (this.x < x ? 1 : -1);
            this.y += dir*Math.sqrt(dist/(dir*dir+1)) * (this.y < y ? 1 : -1);
        } else {
            this.y += diest * (this.y < y ? 1 : -1)
        }
    }
}

class Security  {
    velocity = 0.9;
    radius = 20;

    constructor(x, y) {
        this.coords = new Vector(x, y);
    }    

    draw() {
        drawCircle(this.coords, this.radius, "#000000");
    }

    move(coords) {
        if (this.coords.getDistance(coords) < 1) {
            return;
        }

        this.coords.moveInDir(coords, this.velocity);
        
        if (this.coords.x+this.radius > canvas.width) {
            this.coords.x = canvas.width-this.radius;
        } else if (this.coords.x-this.radius < 0) {
            this.coords.x = this.radius;
        }

        if (this.coords.y+this.radius> canvas.height) {
            this.coords.y = canvas.height-this.radius;
        } else if (this.coords.y-this.radius < 0) {
            this.coords.y = this.radius;
        }
    }
}


class Client {
    radius = 30
    velocity = 1

    constructor(x, y, sick) {
        this.coords = new Vector(x, y);
        this.dest = new Vector(x, y);
        this.sick = sick;
    }    

    draw() {
        if (!this.sick) {
            ctx.drawImage(ethan, this.coords.x-this.radius, this.coords.y-this.radius, this.radius*2, this.radius*2);
        } else {
            ctx.drawImage(cough, this.coords.x-this.radius, this.coords.y-this.radius, this.radius*2, this.radius*2);
        }
       
    }

    makeSick() {
        if (!this.sick) {
            this.sickFor = 0;
            this.sick = true;
            this.velocity *= difficulity;
            this.lifetime = rand(800, 1000);
        
            return true;
        } 

        return false;
    }

    changeDest(security) {
        if (this.coords.getDistance(this.dest) < 3) {
            this.dest = new Vector(rand(this.radius, canvas.width-this.radius), rand(this.radius, canvas.height-this.radius));

            if (this.sick) {       
                let angle = this.coords.getAngle(security.coords, this.dest);
                let dist = this.coords.getDistance(this.dest);

                while (Math.abs(angle) < 0.7 && dist > 150) {
                    this.dest = new Vector(rand(this.radius, canvas.width-this.radius), rand(this.radius, canvas.height-this.radius));

                    angle = this.coords.getAngle(security.coords, this.dest);
                }  
            } 
        }
    }

    move() {
        this.coords.moveInDir(this.dest, this.velocity);
    }

    getCough(cough) {
        if (this.coords.getDistance(cough.coords) < Math.max(this.radius, cough.radius) && this.makeSick()) {
            return true;
        }

        return false;
    }

    live(security) {
        if (this.sick) {
            this.sickFor += 1;

            if (this.sickFor > this.lifetime) {
                if (this.sickFor > this.lifetime+200) {
                    return false;
                }
                this.radius += 0.05;
            }
        }

        this.changeDest(security);
        this.move();

        return true;
    }
}

class Cough {
    constructor(x, y) {
        this.radius = 0;
        this.coords = new Vector(x, y);
    }

    draw() {
        drawEmptyCircle(this.coords, this.radius);
        this.radius += 2;
    }
}


let mousePos = new Vector(100, 100);

const getMousePos = (canvas, evt) => {
    const rect = canvas.getBoundingClientRect();
    return new Vector(evt.clientX-rect.left, evt.clientY - rect.top);
}



let sick = 0;
let clients;
let security;
let level = 0;
let coughs = [];
let dead = 0;


const game = () => {
    sickText.innerHTML = `Poziom: ${level} Zarażeni: ${sick}`;

    if (sick == 0 && coughs.length == 0) {
        level += 1;
        difficulity += 0.1;
        clients = [];
        coughs = [];
        security = new Security(canvas.width-30, canvas.height/2);

        for (let i = 0; i < level+10; i++) {
            clients.push(new Client(0, canvas.height/2, false));
        }

        clients[0].makeSick();

        sick = 1;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    clients.forEach((client, index, object) => {
        if (client.sick) {
            const dist = client.coords.getDistance(security.coords);
            
            if (dist < Math.max(client.radius, security.radius)) {
                object.splice(index, 1);
                sick -= 1;
                
                return;
            }
        }

        if (!client.live(security)) {
            coughs.push(new Cough(client.coords.x, client.coords.y))
            object.splice(index, 1);
            
            dead += 1;
            sick -= 1;
        }

        client.draw();
    });

    security.draw();
    security.move(mousePos);

    coughs.forEach((cough, index, object) => {
        cough.draw();
        
        clients.forEach(victim => {
            if (victim.getCough(cough)) {
                sick += 1;
            }
        })

        if (cough.radius > 100+level*5) {
            object.splice(index, 1);
        }
    });
}

setInterval(game, 10)

