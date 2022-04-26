
const NB = 10;

export class Background {

    constructor(ctx) {
        this.stars = [];
        for (let i=0; i < NB; i++) {
            this.stars[i] = { 
                active: true, 
                x: Math.random() * ctx.width | 0, 
                y: Math.random() * ctx.height | 0, 
                vecX: 0, 
                vecY: 1, 
                speed: (Math.random() * 1 + 1| 0) / 20, 
                size: Math.random() * 18  + 2 | 0
            };
        }
        this.ctx = ctx;
    }

    update(delta) {
        for (let i=0; i < NB; i++) {
            if (this.stars[i].active) {
                this.stars[i].x += this.stars[i].vecX * this.stars[i].speed * delta;
                this.stars[i].y += this.stars[i].vecY * this.stars[i].speed * delta;
                if (this.stars[i].y > this.ctx.height) {
                    reset(this.stars[i], this.ctx.width);
                }
            }
        }
    }
    
    render() {
        this.ctx.fillStyle = "rgba(100,100,100,0.8)";
        for (let i=0; i < NB; i++) {
            this.ctx.font = `${this.stars[i].size}px Courier`;
            this.ctx.fillText("+", this.stars[i].x, this.stars[i].y);
        }
    }

}

function reset(star, width) {
    star.x = Math.random() * width | 0;
    star.y = -star.size;
    star.size = Math.random() * 18  + 2 | 0;
    star.vecX = 0;
    star.vecY = 1;
    star.speed = (Math.random() * 1 + 1 | 0) / 20;
}