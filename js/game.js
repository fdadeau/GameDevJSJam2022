"use strict";

import { Player } from "./player.js";
import { Background } from "./background.js";
import { Enemies, Enemy, newShoot } from "./enemy.js";
import { Bonuses } from "./bonuses.js";

const DEBUG = false;

const TODAY = new Date();
export const KEY = `${TODAY.getFullYear()}${String("0"+(TODAY.getMonth()+1)).substr(-2)}${String("0"+TODAY.getDate()).substr(-2)}`;

export class Game {

    constructor(ctx) {
        this.paused = true;
        this.finished = false;
        this.ctx = ctx;
        this.background = new Background(ctx);
        this.player = new Player(ctx);
        this.enemies = new Enemies(ctx);
        this.bonuses = new Bonuses(ctx);
        this.scoreDisplay = document.getElementById("score");
        this.reset();
    }

    update(delta) {
        if (this.finished || this.paused || this.player.gameover) {
            return;
        };
        this.player.update(delta);
        this.background.update(delta);
        this.enemies.update(delta);
        this.bonuses.update(delta);
        let sc = this.enemies.collisions(this.player.bullets);
        if (sc > 0) {
            this.score += sc;
            this.updateScore();
        }
        this.player.collisions(this.enemies, this.bonuses);
        this.updateScore();
        if (!this.player.particles && this.enemies.enemies.length == 0) {
            this.finished = true;
        }
    }

    render(ctx) {
        ctx.clearRect(0, 0, ctx.width, ctx.height);
        if (this.paused) {
            this.ctx.fillStyle = "white";
            this.ctx.font = "20px courier new";
            this.ctx.fillText("GAME PAUSED", this.ctx.width / 2, this.ctx.height / 2);
            return;
        };
        this.background.render();
        this.bonuses.render(ctx);
        if (this.player.gameover) {
            this.enemies.render(ctx);
            this.ctx.fillStyle = "white";
            this.ctx.font = "20px courier new";
            this.ctx.fillText("GAME OVER", this.ctx.width / 2, this.ctx.height / 2);
            this.ctx.font = "16px courier new";
            this.ctx.fillText("Press R to restart", this.ctx.width / 2, this.ctx.height / 2 + 40);
        }
        else {
            this.player.render(ctx);
            this.enemies.render(ctx);
            if (this.finished) {
                this.ctx.fillStyle = "white";
                this.ctx.font = "20px courier new";
                this.ctx.fillText("CONGRATULATIONS - YOU WIN", this.ctx.width / 2, this.ctx.height / 2);
                this.ctx.fillText("Your score: " + this.score, this.ctx.width / 2, this.ctx.height / 2 + 40);
            }
        }
    }


    keydown(key) {
        if (key == "KeyP") {
            this.paused = !this.paused;
            return;
        }
        if (key == "KeyR" && (this.player.gameover || this.finished)) {
            this.restart();
        }

        this.player.keydown(key);
    }
    keyup(key) {
        this.player.keyup(key);
    }

    resume() {
        this.paused = false;
    }
    pause() {
        this.paused = true;
    }
    restart() {
        this.finished = false;
        this.pause();
        this.reset();
        this.resume();
    }

    reset() {
        this.score = 0;
        this.bestScore = localStorage.getItem(KEY);
        this.updateScore();
        this.player.reset();
        this.bonuses.reset();
        this.enemies.reset();
        this.buildDailyLevel();
        let max = this.enemies.enemies.reduce((acc, e) => acc + e.pts, 0);
        this.max = max;
    }

    
    updateScore() {
        this.scoreDisplay.dataset["value"] = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem(KEY, this.bestScore);
        }
    }

     /** Line of fixed enemies */
     lineFixedEnemies(y, type, nb) {
        for (let i=0; i < nb; i++) {
            let en = new Enemy(this.ctx, ((i+1) * this.ctx.width / (nb+1)), y, type);
            if (type != 3) {
                en.setSize(20);
                en.shoot = { delay: 1000, display: 'o', vecX: 0, vecY: 1, speed: 0.3 };
            }
            this.enemies.addEnemy(en);
        }
    }
    VShapedFixedEnemies(y, type, nb) {
        if (nb > 6) {
            nb = 6;
        }
        else if (nb < 3) {
            nb = 3;
        }
        for (let i=0; i < nb; i++) {
            let x = (i+1) * this.ctx.width / (nb+1);
            let en = new Enemy(this.ctx, x, y, type);
            let middle = (nb-1) / 2;
            en.y = y - Math.abs(i - middle) * en.height * 2;
            if (type != 3) {
                en.setSize(20);
                en.shoot = { delay: 700, display: 'o', vecX: 0, vecY: 1, speed: 0.3 };
            }
            this.enemies.addEnemy(en);
        }
    }

    lineMobileEnemies(y, type, nb) {
        if (type == 3) {
            type--;
        }
        for (let i=0; i < nb; i++) {
            let x = (i+1) * this.ctx.width / (nb+1);
            let space = this.ctx.width / (nb+1);
            let en = new Enemy(this.ctx, x, y, type);
            en.setSize(20);
            en.maxX = x + space;
            en.minX = x - space;
            en.vecX = 3;
            en.shoot = { delay: 1000, display: 'o', vecX: 0, vecY: 1, speed: 0.3 };
            en.onUpdate = function() {
                if (this.y > 0) {
                    this.vecY = 0.6;
                }
                if (this.x > this.maxX) {
                    this.x = this.maxX;
                    this.vecX *= -1; 
                }
                else if (this.x < this.minX) {
                    this.x = this.minX;
                    this.vecX *= -1;        
                }
            }
            this.enemies.addEnemy(en);   
        }
    }

    lineMobileEnemiesFromOutSide(y, type, nb) {
        if (type == 3) {
            type--;
        }
        for (let i=0; i < nb; i++) {
            let x = (1+(i/2 | 0)) * this.ctx.width / (nb+1);
            x = (i % 2 == 0) ? this.ctx.width + x : -x;
            let en = new Enemy(this.ctx, x, y, type);
            en.setSize(20);
            en.y = (i % 2 == 0) ? en.y : en.y - en.height * 1.5; 
            en.shoot = { delay: 1000, display: 'o', vecX: 0, vecY: 1, speed: 0.3 };
            en.onUpdate = function() {
                if (this.y > 0 && this.vecX == 0) {
                    this.vecX = (this.x > 0) ? -2 : 2;
                }
            }
            this.enemies.addEnemy(en);   
        }
    }

    addBoss(y) {
        let en = new Enemy(this.ctx, this.ctx.width / 2, y, 4);
        en.vecY = 1;
        en.setSize(20);
        en.pv = 10;
        en.onUpdate = function(player) {
            if (this.y > this.ctx.height / 5) {
                this.y = this.ctx.height / 5;
                this.vecY = 0;
                this.shoot = { vecX: 0, vecY: 1, speed: 0.6, delay: 300, display: "db"};
            }
            if (this.x < player.x - 20) {
                this.vecX = 1;
            }
            else if (this.x > player.x + 20) {
                this.vecX = -1;
            }
            else {
                this.vecX = 0;
            }
            
        }.bind(en, this.player);
        this.enemies.addEnemy(en);
    }


    buildDailyLevel() {

        const DELTA_Y = this.ctx.height * 0.5;
        let y = -DELTA_Y * 0.2;

        const NB_Waves = getNBWaves();
        DEBUG && console.log({NB_Waves});

        for (let i=1; i <= NB_Waves; i++) {

            let tabAttacks = getAttacks(i, this);
            DEBUG && console.log({tabAttacks});

            for (let j=0; j < tabAttacks.length; j++) {
                let nb = (i + 1) / 2;
                let type = (i+j+Number(KEY[KEY.length-1])) % 4;
                tabAttacks[j].apply(this, [y, type, nb]);
                y -= DELTA_Y;
            }
            let bonus = getBonus(i);
            DEBUG && console.log({bonus});
            this.bonuses.addBonus(this.ctx.width * (Math.random() * 0.6 + 0.2) | 0, y, 0, 1, bonus);
            y -= DELTA_Y;
        }
        
        // final boss
        this.addBoss(y);
        return;

    }
}

function getNBWaves() {
    return 3 + Number(KEY) * 27 % 5;
}

function getAttacks(wave, game) {
    let ret = [];
    const attacks = [ game.lineFixedEnemies, game.VShapedFixedEnemies, game.lineMobileEnemies, game.lineMobileEnemiesFromOutSide ];
    let key = KEY.split("").map(e => Number(e));
    for (let i=0; i < key.length; i++) {
        let i1 = key[i] % attacks.length;
        let i2 = (key[i]+key[key.length-1]+wave) % attacks.length;
        let tmp = attacks[i1];
        attacks[i1] = attacks[i2];
        attacks[i2] = tmp;
    }
    for (let i=1; i <= wave; i++) {
        ret.push(attacks[(i-1) % attacks.length]);
    }
    return ret;
}

function getBonus(i) {
    const BONUSES = ["0", "x2", "1", "2", "x2"];
    return BONUSES[i*Number(KEY[KEY.length-1]) % BONUSES.length];
}
