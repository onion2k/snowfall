
let s = self;
let snowWorkerInstance = undefined;

class snowWorkerWW {
    constructor(data){
        this.active = data.active;
        this.width = data.width;
        this.height = data.height;
        this.snowflakesLifetime = data.lifetime;
        this.snowflakes = [];
        this.platforms = [];
        this.prevTimestamp = Date.now();
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
        this.timefactor = 1;
        for (var i=0; i<this.active; i++) {
            var x = Math.random() * this.width;
            var y = Math.random() * this.height;
            this.snowflakes.push({ x: x, y: y, vx: 80, vy: 40 + (Math.random()*60), s: 2 + (Math.random()*3) });
        }
        s.postMessage({ snowflakes: this.snowflakes, snowflakesStatic: this.snowflakesStatic });
        this.update();
    }
    screenmap(platforms) {
        this.platforms = platforms;
        this.snowflakes.forEach((f,i) => {
            if (f.l>0) {
                let keep = false;
                platforms.forEach((platform) => {
                    if ( (f.x > platform.left && f.x < platform.left+platform.width) ) { keep = true; }
                });
                if (!keep) { f.l=0; }
            }
        });
    }
    update() {

        let timestamp = Date.now();
        let delta = timestamp - this.prevTimestamp;
        let deltaDistance = 1000/delta;
        // let deltaCorrection = this.frameInterval/delta;

        this.snowflakes.forEach((f) => {
            if (f.l > 0) {
                if (f.l--===0) {
                    f.y = 0;
                    f.x = Math.random()*this.width;
                    f.vx = 80;
                    f.vy = 40 + (Math.random()*60);
                }
            } else {
                f.x += (Math.random()*(f.vx/deltaDistance) - ((f.vx/deltaDistance)/2)) * this.timefactor;
                f.y += (f.vy/deltaDistance) * this.timefactor;
                if (f.y>this.height) {
                    f.y = 0;
                    f.x = Math.random()*this.width;
                } else {
                    this.platforms.forEach((platform) => {
                        if ( (f.y > platform.top-3 && f.y < platform.top) && (f.x > platform.left && f.x < platform.left+platform.width) && Math.floor(Math.random()*2)%2==0 ) {
                            f.l = this.snowflakesLifetime;
                        }
                    });
                }
            }
        });
        s.postMessage({ snowflakes: this.snowflakes });
        this.prevTimestamp = timestamp;

        setTimeout(()=>{
            this.update();
        }, this.frameInterval);

    }
}

s.addEventListener('message', (event) => {
    if (event.data.type==='init') {
        snowWorkerInstance = new snowWorkerWW(event.data);
    } else if (event.data.type==='screenmap') {
        if (!snowWorkerInstance) {
            console.warn("No snowfall worker instance");
        } else {
            snowWorkerInstance.screenmap(event.data.platforms);
        }
    }
});
