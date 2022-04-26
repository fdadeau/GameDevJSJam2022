
import { Player } from "./player.js";
import { Background } from "./background.js";
import { Enemies, Enemy, newShoot } from "./enemy.js";
import { Bonuses } from "./bonuses.js";

const TODAY = new Date();
export const KEY = `${TODAY.getFullYear()}${String("0"+(TODAY.getMonth()+1)).substr(-2)}${String("0"+TODAY.getDate()).substr(-2)}`;

export class Game {

    constructor(ctx) {
        this.paused = true;
        this.ctx = ctx;
        this.background = new Background(ctx);
        this.player = new Player(ctx);
        this.enemies = new Enemies(ctx);
        this.bonuses = new Bonuses(ctx);
        this.scoreDisplay = document.getElementById("score");
        this.reset();
    }

    update(delta) {
        if (this.paused || this.player.gameover) {
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
        }
    }


    keydown(key) {
        if (key == "KeyP") {
            this.paused = !this.paused;
            return;
        }
        if (key == "KeyR" && this.player.gameover) {
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
        this.waveEnemy0(3);
        this.waveBonuses();
    }

    updateScore() {
        this.scoreDisplay.dataset["value"] = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem(KEY, this.bestScore);
        }
    }

     /** Fixed wave of enemies */
     waveEnemy0(type) {
        for (let i=0; i < 5; i++) {
            let en = new Enemy(this.ctx, ((i+1) * this.ctx.width / 6), -50, type);
            en.vecY = 1;
            en.speed /= 1.2;
            en.onExplosion = function() {
                return [ newShoot(this.x, this.y, -1, 1, 0.4, '/'), 
                         newShoot(this.x, this.y, 0, 1, 0.4, '|'), 
                         newShoot(this.x, this.y, 1, 1, 0.4, '\\') ];
            }
            //en.shoot = { delay: 1000, display: 'o', vecX: 0, vecY: 1, speed: 0.3 };
            this.enemies.addEnemy(en);
        }
    }

    waveBonuses() {
        this.bonuses.addBonus(this.ctx.width / 2, - this.ctx.height * 0.5, 0, 1, "1");
        this.bonuses.addBonus(this.ctx.width / 2, - this.ctx.height * 0.75, 0, 1, "x2");
        this.bonuses.addBonus(this.ctx.width / 2, - this.ctx.height, 0, 1, "2");
        this.bonuses.addBonus(this.ctx.width / 2, - this.ctx.height * 1.5, 0, 1, "0");
        this.bonuses.addBonus(this.ctx.width / 2, - this.ctx.height * 1.75, 0, 1, "x2");
    }


}