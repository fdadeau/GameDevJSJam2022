"use strict";

const DEBUG = false;

const DISPLAY = {
    "0": "[0]",
    "1": "[1]",
    "2": "[2]",
    "x2": "[x2]",
}

const SPEED = 0.1;

const HEIGHT = 15;

export class Bonuses {

    constructor(ctx) {
        this.ctx = ctx;
        this.reset();
        this.audio = new Audio();
        this.audio.src = "sounds/bonus.wav";
    }

    reset() {
        this.bonuses = [];
    }

    addBonus(x, y, vecX, vecY, type) {
        this.bonuses.push({ x, y, vecX, vecY, speed: SPEED, type, display: DISPLAY[type] });
    }
    
    removeBonus(i) {
        this.audio.currentTime = 0;
        if (this.audio.paused) {
            this.audio.play();
        }
        this.bonuses.splice(i, 1);
    }

    update(delta) {
        for (let i=0; i < this.bonuses.length; i++) {
            this.bonuses[i].x += delta * this.bonuses[i].speed * this.bonuses[i].vecX;
            this.bonuses[i].y += delta * this.bonuses[i].speed * this.bonuses[i].vecY;
            if (this.isOut(i)) {
                this.bonuses.splice(i, 1);
                i--;
            }
        }
    }

    render() {
        
        this.ctx.font = `${HEIGHT}px Courier`;
        this.ctx.fillStyle = "lightgreen";
        for (let i=0; i < this.bonuses.length; i++) {
            if (this.bonuses[i].y < -this.ctx.height/4) {
                continue;
            }    
            this.ctx.fillText(this.bonuses[i].display, this.bonuses[i].x, this.bonuses[i].y);
            if (DEBUG) {
                let [x, y, w, h] = this.getBoundingRect(i);   
                this.ctx.strokeRect(x, y, w, h);
            }
        }
    }

    getBoundingRect(i) {
        return [this.bonuses[i].x - this.bonuses[i].display.length*HEIGHT*0.2, this.bonuses[i].y - HEIGHT, this.bonuses[i].display.length*HEIGHT*0.4, HEIGHT];
    }

    isOut(i) {
        return this.bonuses[i].y > this.ctx.height + HEIGHT;
    }

}
