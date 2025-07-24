const canvas = document.querySelector("canvas");
const score = document.getElementById("score");
const life = document.getElementById("life");
const hs = document.getElementById("hs");
const c = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let animId;
let fruitspawn = false;
let gen = false;
let end = false;
let points = 0;
let missedfruit =0;
let fruits = [];
let trail = [];
let heart = ['❤️','❤️','❤️','❤️','❤️'];
let ballradius = [15,25,35]
let splash = [];
let xspeed = [-4,4,-2,2,-3,3,-2.5,2.5,-3.5,3.5,];
let colors = ["red","green","purple","yellow","white"];
let cursor = {
    x:undefined,
    y:undefined,
}

life.textContent = `${heart.join("")}`
let playerhighscore = JSON.parse(localStorage.getItem("hs"));
if(playerhighscore!=null){
    hs.textContent = `High Score: ${playerhighscore}`;
}


function randint(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

function circleCircleCollision(swordx,swordy,fruitx,fruity,r1,r2){
    let dist = Math.hypot(swordx-fruitx,swordy-fruity);
    return (dist<r1+r2);
}

class Fruit{
    constructor(x,y,rad,dx,dy,col){
        this.x = x;
        this.y = y;
        this.color = col;
        this.radius = rad;
        this.dx = dx;
        this.dy = dy;
    }
    draw(){
        c.beginPath();
        c.fillStyle = this.color;
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        c.fill();
        c.closePath();
        c.font = "10px Arial"; 
        c.fillStyle = "black";
        c.textAlign = "center";
        c.textBaseline = "middle";
        if(this.color=="white"){
            c.fillText("BOMB",this.x,this.y)
        }
    }

    update(){
        this.x+=this.dx;
        this.y-=this.dy;
        this.dy-=0.17;
        this.draw();
    }
}
class Sword{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.radius = 10
    }
    draw(){
        c.beginPath()
        c.fillStyle="white";
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        c.fill();
        c.closePath();
    }
    update(){
        this.draw();
    }
}
class Splash{
    constructor(x,y,color){
        this.x = x;
        this.y = y;
        this.radius = Math.random()*3+2;
        this.color = color;
        this.alpha = 1;
        this.dx = (Math.random()-0.5)*6;
        this.dy = (Math.random()-0.5)*6;
    }

    draw(){
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
        c.restore();
    }

    update(){
        this.x += this.dx;
        this.y += this.dy;
        this.dy += 0.1;
        this.alpha -= 0.02;
        this.draw();
    }
}
class Trail{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.radius = 6;
        this.alpha = 1;
    }
    draw(){
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        c.fillStyle = "white";
        c.fill();
        c.closePath();
        c.restore();
    }

    update(){
        this.alpha -= 0.09;
        this.draw();
    }
}


function checkfruitdelete(){
    if(fruits.length!=0){
        for(let i=0;i<fruits.length;i++){
            if(fruits[i].y>canvas.height){
                if(fruits[i].color!="white"){
                    heart.pop();
                    life.textContent = `${heart.join("")}`
                    missedfruit++;
                    if(missedfruit>=5){
                        gameOver();
                    }
                } 
                fruits.splice(i,1);
                --i;
            }
            if(fruits.length==0) fruitspawn=false;
        }
    }
}

function genfruit(){
    for(let i=0;i<randint(2,5);i++){
        let fruit = new Fruit(randint(100,canvas.width-100),canvas.height,ballradius[randint(0,2)],xspeed[randint(0,9)],randint(11,15),colors[randint(0,4)]);
        fruits.push(fruit);
    }
    fruitspawn = false;
}
genfruit();

function checkfruitcut(){
    for(let i=0;i<fruits.length;i++){
        if(circleCircleCollision(sword.x,sword.y,fruits[i].x,fruits[i].y,sword.radius,fruits[i].radius)){
            const fruit = fruits[i];
            if(fruit.color=="white"){
                gameOver();
            }
            for(let j=0;j<20;j++){
                let fruitsplash = new Splash(fruit.x,fruit.y,fruit.color);
                splash.push(fruitsplash);
            }
            if(fruit.radius==15 && fruit.color!="white"){
                points+=2;
            }
            else if(fruit.radius==25 && fruit.color!="white"){
                points+=1;
            }
            else if(fruit.radius==35 && fruit.color!="white"){
                points+=0.5;
            }
            fruits.splice(i,1);
            score.innerHTML = `Score: ${points}`;
            if(fruits.length==0 && !gen){
                gen=true;
                setTimeout(()=>{
                    gen=false;
                    genfruit();
            },1000)
            } 
        }
    }
}

function gameOver(){
    cancelAnimationFrame(animId);
    c.clearRect(0,0,2000,2000);
    canvas.remove();
    if(playerhighscore!=null){
        if(points>playerhighscore){
            playerhighscore = points;
            localStorage.setItem("hs",JSON.stringify(playerhighscore));
        }
    }
    else{
        playerhighscore = points;
        localStorage.setItem("hs",JSON.stringify(playerhighscore));
    }
    const over = document.createElement("div");
    const child = document.createElement("div");
    over.style.display = "flex";
    over.style.justifyContent = "center";
    over.style.alignItems = "center";
    over.style.height = `500px`
    child.textContent = "Game Over!";
    child.style.color="white";
    child.style.fontSize="50px";
    child.style.fontWeight="900";
    over.appendChild(child);
    document.body.append(over);
}

addEventListener("mousemove",(e)=>{
    cursor.x = e.clientX;
    cursor.y = e.clientY;
    let trailcursor = new Trail(cursor.x,cursor.y);
    trail.push(trailcursor);
    sword.x=cursor.x;
    sword.y = cursor.y;
})

let sword = new Sword(canvas.width/2,canvas.height/2);

function main(){
    c.clearRect(0,0,2000,2000);
    c.fillStyle = "black";
    c.fillRect(0,0,canvas.width,canvas.height);
    if(!fruitspawn){
        fruitspawn = true;
        if(fruits.length==0){
            genfruit();
        }
    }
    for(let i=0;i<fruits.length;i++){
        fruits[i].update();
    }
    for(let i=0;i<splash.length;i++){
        splash[i].update();
        if(splash[i].alpha<=0.1){
            splash.splice(i,1);
            i--;
        }
    }
    for(let i=0;i<trail.length;i++){
        trail[i].update();
        if(trail[i].alpha<=0.1){
            trail.splice(i,1);
            i--;
        }
    }
    checkfruitdelete();
    sword.update();
    checkfruitcut();
    animId = requestAnimationFrame(main);
}
main();