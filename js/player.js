"use strict";

const DEBUG = false;

const HEIGHT = 8;

const NB_PARTICLES = 30;
const PARTICLES = "@#$*%§&";

const DELAY = 800;

const PV = 1;

export class Player {

    constructor(ctx) {
        this.ctx = ctx;
        this.audio = new Audio();

        this.speed = 0.35;
        // data
        this.text = ["      II      ",
                     "     /  \\     ",
                     "I   / @@ \\   I", 
                     "I  |  @@  |  I",
                     "I__|  @@  |__I",
                     " \\___________/ "];
        this.height = this.text.length * HEIGHT;
        
        this.reset();
    }

    reset() {
        // game over
        this.gameover = false;
        // starting position 
        this.x = this.ctx.width / 2;
        this.y = this.ctx.height * 0.9;
        // movement
        this.vec = { x: 0, y: 0 };
        // shoots
        this.isShooting = false;
        this.type = 0;
        // bullets shot
        this.bullets = [];
        this.delay = 0;
        this.delayBonus = 1;
        // particle explosions 
        this.particles = null;
        // basic sound: shot
        this.audio.src = "sounds/piou.wav";
    }

    update(delta) {

        // update bullets
        this.delay -= delta;
        if (this.isShooting && this.delay <= 0) {
            this.shoot();
            this.delay = DELAY / this.delayBonus;
        }
        for (let i=0; i < this.bullets.length; i++) {
            this.bullets[i].x += this.bullets[i].speed * this.bullets[i].vecX * delta;
            this.bullets[i].y += this.bullets[i].speed * this.bullets[i].vecY * delta;
            if (this.bullets[i].x < 0 || this.bullets[i].x > this.ctx.width || this.bullets[i].y < 0 || this.bullets[i].y > this.ctx.height) {
                this.bullets.splice(i, 1);
                i--;
            }
        }        

        // explosion in progress
        if (this.particles) {
            for (let i=0; i < this.particles.length; i++) {
                this.particles[i].delay -= delta;
                this.particles[i].expiration -= delta;
                if (this.particles[i].expiration < 0) {
                    this.particles.splice(i, 1);
                    i--;
                }
            }
            if (this.particles.length == 0) {
                this.gameover = true;
            }            
            return;
        }

        // no explosion --> player still in game

        // update player position
        this.x += delta * this.speed * this.vec.x;
        if (this.x < this.text[0].length / 3 * HEIGHT) {
            this.x = this.text[0].length / 3 * HEIGHT;
        }
        else if (this.x > this.ctx.width - this.text[0].length / 3 * HEIGHT) {
            this.x = this.ctx.width - this.text[0].length / 3 * HEIGHT;
        }
        
        this.y += delta * this.speed * this.vec.y;
        if (this.y > this.ctx.height - 2) {
            this.y = this.ctx.height - 2;
        }
        else if (this.y < this.height - 2) {
            this.y = this.height - 2;
        }

    }

    render(ctx) {

        // render bullets
        ctx.fillStyle = "yellow";
        ctx.font = "13px Courier";
        for (let i=0; i < this.bullets.length; i++) {
            ctx.fillText(this.bullets[i].display, this.bullets[i].x, this.bullets[i].y);
        }

        // if exploding
        if (this.particles) {
            ctx.font = `${HEIGHT*2}px Courier`;
            this.ctx.fillStyle = "red";
            for (let i=0; i < this.particles.length; i++) {
                if (this.particles[i].delay < 0) {
                    this.ctx.fillText(this.particles[i].display, this.particles[i].x, this.particles[i].y);
                }
            }
            return;
        }

        ctx.clearRect(...this.getBoundingRect());

        ctx.font = `${HEIGHT}px Courier`;
        ctx.fillStyle = "white";
        this.text.forEach((t, i) => {
            ctx.fillText(t, this.x | 0, this.y - (this.text.length - 1 - i) * HEIGHT | 0);
        });
        if(DEBUG) {
            let [x, y, w, h] = this.getBoundingRect();
            ctx.strokeRect(x, y, w, h);
        }
    }
    
    getBoundingRect() {
        return [this.x - this.text[0].length * HEIGHT * 0.2 | 0, 
                this.y - (this.text.length - 1) * HEIGHT | 0, 
                this.text[0].length * HEIGHT * 0.42 | 0, 
                (this.text.length - 1) * HEIGHT | 0 
            ];
    }


    getCenterShoot() {
        return [ this.x, this.y - (this.text.length - 1) * HEIGHT ];
    }
    getLeftShoot() {
        return [ this.x - this.text[0].length * HEIGHT / 3.5, this.y - (this.text.length - 3) * HEIGHT | 0 ];
    }
    getRightShoot() {
        return [ this.x + this.text[0].length * HEIGHT / 3.5, this.y - (this.text.length - 3) * HEIGHT | 0 ];
    }
    
    getRightShoot2() {
        return [ this.x + this.text[0].length * HEIGHT / 3.5, this.y - 2 * HEIGHT | 0 ];
    }
    getLeftShoot2() {
        return [ this.x - this.text[0].length * HEIGHT / 3.5, this.y - 2 * HEIGHT | 0 ];
    }
    

    shoot() {
        this.audio.currentTime = 0
        if (this.audio.paused) {
            this.audio.play();
        }
        switch (this.type) {
            case 0:
                let [xc, yc] = this.getCenterShoot();
                this.bullets.push({ vecX: 0, vecY: -1, x: xc, y: yc, speed: 0.5, display: "I", pv: PV*2 });
                break;
            case 2: 
                let [xl2, yl2] = this.getLeftShoot2();
                let [xr2, yr2] = this.getRightShoot2(); 
                this.bullets.push({ vecX: -1, vecY: 0, x: xl2, y: yl2, speed: 0.5, display: "o", pv: PV });
                this.bullets.push({ vecX: 1, vecY: 0, x: xr2, y: yr2, speed: 0.5, display: "o", pv: PV });    
            case 1:
                let [xl, yl] = this.getLeftShoot();
                let [xr, yr] = this.getRightShoot();
                this.bullets.push({ vecX: 0, vecY: -1, x: xl, y: yl, speed: 0.5, display: "I", pv: PV*2 });
                this.bullets.push({ vecX: 0, vecY: -1, x: xr, y: yr, speed: 0.5, display: "I", pv: PV*2 });
                break;
        }
    }

    collisions(enemies, bonuses) {
        if (this.particles) {
            return;
        }
        let [x, y, w, h] = this.getBoundingRect();
        for (let i=0; i < enemies.enemies.length; i++) {
            if (enemies.enemies[i].particles) {
                continue;
            }
            if (enemies.enemies[i].state == 0 && collision([x, y, w, h], enemies.enemies[i].getBoundingRect())) {
                this.explosion();
                enemies.enemies[i].explosion();
                return;
            }
        }
        for (let i=0; i < enemies.bullets.length; i++) {
            if (enemies.bullets[i].x >= x && enemies.bullets[i].x <= x + w && enemies.bullets[i].y >= y && enemies.bullets[i].y <= y + h) {
                enemies.bullets.splice(i, 1);
                this.explosion();
                return;
            }
        }
        for (let i=0; i < bonuses.bonuses.length; i++) {
            if (collision([x, y, w, h], bonuses.getBoundingRect(i))) {
                switch (bonuses.bonuses[i].type) {
                    case "x2": 
                        this.delayBonus++;
                        break;
                    default: 
                        this.type = Number(bonuses.bonuses[i].type);
                };
                bonuses.removeBonus(i);
                i--;
            }
        }
    }

    explosion() {
        this.audio.src = "sounds/explosion.wav";
        this.audio.play();
        this.isShooting = false;
        this.particles = [];
        let [x, y, w, h] = this.getBoundingRect();
        let radius = (w > h) ? w / 2 : h / 2;
        for (let i=0; i < NB_PARTICLES; i++) {
            let delay = 100 * (i / 4 | 0);
            let duration = Math.random() * 1000 | 0;
            let display = PARTICLES[Math.random() * PARTICLES.length | 0];
            this.particles.push(newParticle(x + w/2, y + h/2, delay, delay + duration, display, radius));
        }
        this.particles.sort((p1, p2) => p1.delay - p2.delay);
    }


    keydown(key) {
        if (this.particles) {
            return;
        }
        switch (key) {
            case "ArrowLeft": 
                this.vec.x = -1;
                break;
            case "ArrowRight":
                this.vec.x = 1;
                break;
            case "ArrowUp":
                this.vec.y = -1;
                break;
            case "ArrowDown": 
                this.vec.y = 1;
                break;
            case "Space":
                this.isShooting = true;
                break;
        }
    }

    keyup(key) {
        if (this.particles) {
            return;
        }
        switch (key) {
            case "ArrowLeft": 
                if (this.vec.x < 0) {
                    this.vec.x = 0;
                }
                break;
            case "ArrowRight":
                if (this.vec.x > 0) {
                    this.vec.x = 0;
                }
                break;
            case "ArrowUp":
                if (this.vec.y < 0) {
                    this.vec.y = 0;
                }
                break;
            case "ArrowDown": 
                if (this.vec.y > 0) {
                    this.vec.y = 0;
                }
                break;
            case "Space":
                if (this.isShooting) {
                    this.isShooting = false;
                }
                break;

        } 
    }

}


function newParticle(x, y, delay, expiration, display, radius) {
    x = x + (Math.random() * radius*2 | 0) - radius;
    y = y + (Math.random() * radius*2 | 0) - radius;
    return { x, y, delay, expiration, display };
}


function collision([x1,y1,w1,h1],[x2,y2,w2,h2]) {
    return !(x2 > x1 + w1 || x2 + w2 < x1 || y2 > y1 + h1 || y2 + h2 < y1);
}
