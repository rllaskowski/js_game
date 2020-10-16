const sickText = document.getElementById("sick-text");
const levelText = document.getElementById("level-text");
const resetBtn = document.getElementById("reset-btn");
const speedBar = document.getElementById("speed-bar");
const weaponBar = document.getElementById("weapon-bar");

import { 
    canvas,
    drawCircle,
    drawEmptyCircle,
    writeText,
    clear,
    drawImage
} from "./drawing";

const ethanImage = new Image();
ethanImage.src = "./static/img/ethan.png";

const coughImage = new Image(); 
coughImage.src = "./static/img/cough.png";

const sanatizerImage = new Image(); 
coughImage.src = "./static/img/cough.png";


const rand = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}


const texts = [
    "Obudzcie się ludzie!",
    "Wirusa nie ma!",
    "Zdejmijcie kagańce!",
    "Co z wami nie tak?!",
    "Propaganda!",
    "To wszystko kłamstwo!"
]



let difficulity = 1.3;

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

    getAngle(v1, v2) {
        return Math.atan2(v1.y-this.y, v1.x-this.x) - Math.atan2(v2.y-this.y, v2.x-this.x);
    }

    moveInDir(vector, dist) {
        const x = vector.x;
        const y = vector.y;

        if (x != this.x) {
            const dir = Math.abs((y-this.y)/(x-this.x));

            this.x += Math.sqrt(dist/(dir*dir+1)) * (this.x < x ? 1 : -1);
            this.y += dir*Math.sqrt(dist/(dir*dir+1)) * (this .y < y ? 1 : -1);
        } else {
            this.y += dist * (this.y < y ? 1 : -1)
        }
    }
}


class Weapon {
    constructor(x, y) {
        this.radius = 0;
        this.coords = new Vector(x, y);
    }

    draw() {
        drawEmptyCircle(this.coords, this.radius, "#4CAF50");
        this.radius += 2;
    }
}


class Security  {
    constructor(x, y) {
        this.velocity = 0.9;
        this.radius = 20;
        this.coords = new Vector(x, y);
        this.weapon = null;
    }    

    draw() {
        drawCircle(this.coords, this.radius, "#000000");

        if (this.weapon) {
            this.weapon.draw();
        }
    }

    live() {

    }

    move(coords, speeding) {
        if (this.coords.getDistance(coords) < 1) {
            return;
        }

        this.coords.moveInDir(coords, this.velocity * speeding? 2 : 1);
        
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

    getBonus(bonus) {
        if (this.coords.getDistance(bonus.coords) < this.radius+bonus.radius) {
            return true;
        }

        return false;
    }

    useWeapon() {
        if (this.weapon === null) {
            this.weapon = new Weapon(this.coords.x, this.coords.y);
        }
    }
}


class Bonus {
    constructor() {
        this.radius = 30;
        const x = rand(this.radius, canvas.width-this.radius);
        const y = rand(this.radius, canvas.height-this.radius);

        this.coords = new Vector(x, y);
    }

    draw() {
        drawImage(this.coords, sanatizer, new Vector(this.radius*2, this.radius*2));
    }
}


class Client {
    constructor(x, y, sick) {
        this. radius = 30
        this.velocity = 1
        this.coords = new Vector(x, y);
        this.dest = new Vector(x, y);
        this.sick = sick;
    }    

    draw() {
        if (!this.sick) {
            drawImage(this.coords, ethan, new Vector(this.radius*2, this.radius*2));
        } else {
            drawImage(this.coords, cough, new Vector(this.radius*2, this.radius*2));
        }
       
    }

    makeSick() {
        if (!this.sick) {
            this.sick = true;
            this.velocity = difficulity;
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

                while (Math.abs(angle) < 0.7 && dist > 130) {
                    this.dest = new Vector(rand(this.radius, canvas.width-this.radius), rand(this.radius, canvas.height-this.radius));

                    angle = this.coords.getAngle(security.coords, this.dest);
                }  
            } 
        }
    }

    move() {
        this.coords.moveInDir(this.dest, this.velocity);
    }

    makeHealthy() {
        if (this.sick) {
            this.sick = false;
            this.radius = 30;
            
            return true;
        }
        return false;
    }
    
    getWeapon(weapon) {
        if(this.coords.getDistance(weapon.coords) <  this.radius+weapon.radius && this.makeHealthy()) {
            return true
        }

        return false;
    }


    getCough(cough) {
        if (this.coords.getDistance(cough.coords) < Math.max(this.radius, cough.radius) && this.makeSick()) {
            return true;
        }

        return false;
    }

    live(security) {
        if (this.sick) {
            this.lifetime -= 1;

            if (this.lifetime <= 100) {
                if (this.lifetime <= 0) {
                    this.lifetime = rand(800, 1000);
                    this.radius = 30;
                    this.velocity = difficulity;

                    return false;
                }
                this.radius += 0.1;
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
        this.text = texts[rand(0, texts.length)];


    }

    draw() {
        drawEmptyCircle(this.coords, this.radius, "#FF0000");
        writeText(this.coords, this.text);
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
let weaponReload = 0;
let speedReload = 0;
let bonusReload;
let speeding = 0;
let bonus;
let hasBonus;


const WEAPON_RELOAD = 1000;
const SPEED_RELOAD = 5000;
const SPEED_TIME = 2000;
const FREQ = 10;
const DIFFICULITY_JUMP = 0.05;
const COUGH_RADIUS = 100;
const WEAPON_RADIUS = 100;

const fillBar = () => {
    if (speeding > 0) {
        const percent = Math.floor((speeding/(SPEED_TIME))*100);
        speedBar.style.background = `linear-gradient(90deg, #5CB85C ${percent}%, #D9534F 0%)`;
    } else {
        const percent = 100-Math.floor((speedReload/(SPEED_RELOAD))*100);
        speedBar.style.background = `linear-gradient(90deg, #5CB85C ${percent}%, #D9534F 0%)`;
    }

    if (weaponReload > 0) {
        const percent = 100-Math.floor((weaponReload/(WEAPON_RELOAD))*100);
        weaponBar.style.background = `linear-gradient(90deg, #5CB85C ${percent}%, #D9534F 0%)`;
    } else {
        weaponBar.style.background = `linear-gradient(90deg, #5CB85C 100%, #D9534F 0%)`;
    }
}


const prepareLevel = () => {
    level += 1;
    difficulity += DIFFICULITY_JUMP;
    clients = [];
    coughs = [];
    bonus = null;
    bonusReload = rand(8000, 10000);
    weaponReload = 0;
    speeding = 0; 
    speedReload = 0;
    security = new Security(canvas.width-30, canvas.height/2);
    sick = 0;
    hasBonus = false;

    for (let i = 0; i < level+5; i++) {
        clients.push(new Client(0, canvas.height/2, false));
    }

    for (let i = 0; i < level/2; i++) {
        sick += 1;
        clients[i].makeSick();
    }
  

    levelText.innerHTML = `Poziom ${level}`;
}


const game = () => {
    if (level == 0 || (sick == 0 && coughs.length == 0)) {
        prepareLevel();
    }

    sickText.innerHTML = `Bez maseczki: ${sick}`;
    clear();


    if (bonus) {
        if (security.getBonus(bonus)) {
            bonus = null;
            bonusReload = rand(8000, 10000);
            hasBonus = true;
        } else {
            bonus.draw();
        }
    } else if (bonusReload <= 0) {
        bonus = new Bonus();

    }
  

    clients.forEach(client => {
        if (!client.live(security)) {
            coughs.push(new Cough(client.coords.x, client.coords.y))
        }

        if (security.weapon && client.getWeapon(security.weapon)) {
            sick -= 1;
        }

        client.draw();
    });

    security.live();
    security.draw();
    security.move(mousePos, speeding > 0);

    
    if (security.weapon && security.weapon.radius > WEAPON_RADIUS*(hasBonus? 2: 1)) {
        security.weapon = null;
        hasBonus = false;
        weaponReload = WEAPON_RELOAD;
    }

    coughs.forEach((cough, index, object) => {
        cough.draw();
        
        clients.forEach(victim => {
            if (victim.getCough(cough)) {
                sick += 1;
            }
        })

        if (cough.radius > COUGH_RADIUS*difficulity) {
            object.splice(index, 1);
        }
    });

    weaponReload = Math.max(weaponReload-FREQ, 0);
    speedReload = Math.max(speedReload-FREQ, 0);
    speeding = Math.max(speeding-FREQ, 0);
    
    if (!hasBonus) {
        bonusReload = Math.max(bonusReload-FREQ, 0);
    }

    fillBar();
}


resetBtn.onclick = () => {
    level = 0;
    document.activeElement.blur();
    
}

document.onmousemove = evt => {
    mousePos = getMousePos(canvas, evt);
}

document.onkeypress = evt => {
    if (evt.code == "Space" && weaponReload <= 0) {
        security.useWeapon();
    } else if (evt.code == "KeyS" && speedReload <= 0) {
        speedReload = SPEED_RELOAD+SPEED_TIME;
        speeding = SPEED_TIME;
    }
}

setInterval(game, FREQ)

