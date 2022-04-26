
import { Game, KEY } from "./game.js";


document.addEventListener("DOMContentLoaded", async function() {
    
    if (!localStorage.getItem(KEY)) {
        localStorage.clear();
        localStorage.setItem(KEY, 0);
    }
    
    // disable right-click
    document.oncontextmenu = function(e) { e.preventDefault(); return false; };
    document.ondblclick = function(e) { e.preventDefault(); return false; };

    let requestFullscreen = document.body.requestFullscreen || 
                            document.body.webkitRequestFullscreen || 
                            document.body.mozRequestFullscreen;


    let WIDTH = 480;
    let HEIGHT = 480;

    let context = document.getElementById("cvs").getContext("2d");  
    context.width = WIDTH;
    context.height = HEIGHT;          
    context.fillStyle = "white";
    context.textAlign = "center";
    context.textBaseline = "bottom";
    context.font = "8px Courier";
    context.strokeStyle = "red";

    // Game instance
    let game = new Game(context);

    document.querySelector("h4[data-score]").dataset.score = localStorage.getItem(KEY);


    // Game loop
    let last = Date.now();    
    function mainloop() {
        requestAnimationFrame(mainloop);
        let now = Date.now();
        let delta = now-last;
        game.update(delta);
        game.render(context);
        last = now;
    }
    mainloop();


    document.addEventListener("keydown", function(e) {
        game.keydown(e.code);
    });
    document.addEventListener("keyup", function(e) {
        game.keyup(e.code);
    });

    document.getElementById("btnPlay").addEventListener("click", function(e) {
        document.body.className = "game";
        game.restart();
    })
    document.getElementById("btnHowTo").addEventListener("click", function(e) {
        document.body.className = "howto";
    })
    document.getElementById("btnBack").addEventListener("click", function(e) {
        document.body.className = "title";
    })

});
