"use strict";

const DEBUG = false;

const DISPLAY = {
    "0": "(IoI)",
    "1": "(}o{)",
    "2": "[}oo{]",
    "3": [" \\ | / ", 
          "--[X]--",
          " / | \\ "],
    "4": ["   \\/   ",
          "|°  °|",
          "(\"\"\"\")",
          " \"\"\"\" "]
}

const SPEED = 0.1;
const HEIGHT = 14;

const SHOOT_DELAY = 400;

const PARTICLES = "@#$*%§&";
const NB_PARTICLES = 20;

const PV = {
    "0": 2,
    "1": 3,
    "2": 4,
    "3": 1,
    "4": 100
};
const POINTS = {
    "0": 200,
    "1": 300,
    "2": 400,
    "3": 100,
    "4": 20000
};

const audio = new Audio();

export class Enemies {

    constructor(ctx) {
        this.ctx = ctx;
        this.reset();
        audio.src = "sounds/boom.wav";
    }

    reset() {
        this.enemies = [];
        this.bullets = [];
    }


    addEnemy(en) {
        this.enemies.push(en);
    }

    update(delta) {
        for (let i=0; i < this.enemies.length; i++) {
            let t = this.enemies[i].update(delta);
            if (t) {
                this.bullets = this.bullets.concat(t);
            }
            if (this.enemies[i].isOut() || this.enemies[i].isDestroyed()) {
                this.enemies.splice(i, 1);
                i--;
            }
        }
        for (let i=0; i < this.bullets.length; i++) {
            this.bullets[i].x += this.bullets[i].vecX * this.bullets[i].speed * delta;
            this.bullets[i].y += this.bullets[i].vecY * this.bullets[i].speed * delta;
            if (this.bullets[i].x < 0 || this.bullets[i].x > this.ctx.width || this.bullets[i].y < 0 || this.bullets[i].y > this.ctx.height) {
                this.bullets.splice(i, 1);
                i--;
            }
        }
    }

    render() {
        for (let i=0; i < this.enemies.length; i++) {
            this.enemies[i].render();
        }
        this.ctx.fillStyle = "lightblue";
        this.ctx.font = `${HEIGHT}px Courier New`;
        for (let i=0; i < this.bullets.length; i++) {
            this.ctx.fillText(this.bullets[i].display, this.bullets[i].x, this.bullets[i].y);
        }
    }

    /**
     * Check collisions 
     * @param {*} bullets 
     */
    collisions(bullets) {
        let sc = 0;
        for (let i=0; i < this.enemies.length; i++) {
            if (this.enemies[i].particles) {
                continue;
            }
            let [x, y, w, h] = this.enemies[i].getBoundingRect();
            for (let j=0; j < bullets.length; j++) {
                if (bullets[j].x >= x && bullets[j].x <= x + w && bullets[j].y >= y && bullets[j].y <= y + h) {
                    this.enemies[i].pv -= bullets[j].pv;
                    bullets.splice(j, 1);
                    j--;                
                    if (this.enemies[i].pv <= 0) {
                        sc += this.enemies[i].pts;
                        let t = this.enemies[i].explosion();
                        if (t) {
                         this.bullets = this.bullets.concat(t);
                        }
                    }
                    break;
                }
            }
        }
        return sc;
    }
}


export class Enemy {

    constructor(ctx, x, y, type) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.speed = SPEED;
        this.vecX = 0;
        this.vecY = 1;
        this.state = 0;
        this.particles = null;
        this.display = DISPLAY[type];
        this.delay = 0;
        this.setSize(HEIGHT);
        this.pv = PV[type];
        this.pts = POINTS[type];
        if (this.type == 3) {
            this.onExplosion = function() {
                return [ newShoot(this.x, this.y, -1, 1, 0.4, '/'), 
                        newShoot(this.x, this.y, 0, 1, 0.4, '|'), 
                        newShoot(this.x, this.y, 1, 1, 0.4, '\\') ];
            }
        }
    }

    setSize(s) {
        this.size = s;
        this.width = (this.display instanceof Array) ? this.display[0].length * this.size * 0.4 : this.display.length * this.size * 0.4 ;
        this.height = (this.display instanceof Array) ? this.display.length * this.size : this.size;
    }

    update(delta) {
        if (this.particles == null) {
            this.x += this.vecX * this.speed * delta;  
            this.y += this.vecY * this.speed * delta;  
            if (this.shoot) {
                if (this.delay <= 0) {
                    this.delay = this.shoot.delay;
                    return newShoot(this.x, this.y, this.shoot.vecX, this.shoot.vecY, this.shoot.speed, this.shoot.display);
                }
                else {
                    this.delay -= delta;
                }
            }
            if (this.onUpdate) {
                this.onUpdate();
            }
        }
        else {
            for (let i=0; i < this.particles.length; i++) {
                this.particles[i].x += this.speed * delta * this.vecX;
                this.particles[i].y += this.speed * delta * this.vecY;
                this.particles[i].delay -= delta;
                this.particles[i].expiration -= delta;
                if (this.particles[i].expiration < 0) {
                    this.particles.splice(i, 1);
                    i--;
                }
            }
            if (this.particles.length == 0) {
                this.particles = null;
                this.state = -1;
            }
        }
    }

    render() {
        this.ctx.font = `${this.size}px Courier New`;
        if (this.particles) {
            this.ctx.fillStyle = "red";
            for (let i=0; i < this.particles.length; i++) {
                if (this.particles[i].delay < 0) {
                    this.ctx.fillText(this.particles[i].display, this.particles[i].x, this.particles[i].y);
                }
            } 
            return;
        }
        if (this.y < -this.height) {
            return;
        }

        let [x, y, w, h] = this.getBoundingRect();   
        this.ctx.clearRect(x, y, w, h);

        this.ctx.fillStyle = "lightblue";
        if (this.display instanceof Array) {
            let l = this.display.length;
            for (let i=0; i < l; i++) {
                this.ctx.fillText(this.display[i], this.x, this.y - (l - 1 - i) * this.size);    
            }
        }
        else {
            this.ctx.fillText(this.display, this.x, this.y);
        }
        if (DEBUG) {
            this.ctx.strokeRect(x, y, w, h);
        }
    }

    explosion() {
        audio.currentTime = 0
        if (audio.paused) {
            audio.play();
        }        
        this.particles = [];
        let [x, y, w, h] = this.getBoundingRect();
        let radius = (w > h) ? w / 2 : h / 2;
        for (let i=0; i < NB_PARTICLES; i++) {
            let delay = 100 * (i / 4 | 0);
            let duration = Math.random() * 1000 | 0;
            let display = PARTICLES[Math.random() * PARTICLES.length | 0];
            this.particles.push(newParticle(x + w/2, y + w/2, delay, delay + duration, display, radius));
        }
        // this.particles.sort((p1, p2) => p1.delay - p2.delay);
        return (this.onExplosion) ? this.onExplosion() : null;
    }


    getBoundingRect() {
        return [this.x - this.width / 2, this.y - this.height, this.width, this.height];
    }

    isOut() {
        return this.y > this.ctx.height + this.height;
    }
    isDestroyed() {
        return this.state < 0;
    }

}


export function newShoot(x, y, vecX, vecY, speed, display) {
    return { 
        x, 
        y, 
        speed, 
        vecX,
        vecY,
        display
    };
}

function newParticle(x, y, delay, expiration, display, radius) {
    x = x + (Math.random() * radius*2 | 0) - radius;
    y = y + (Math.random() * radius*2 | 0) - radius;
    return { x, y, delay, expiration, display };
}
