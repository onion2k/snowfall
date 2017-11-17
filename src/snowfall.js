import SnowWorker from './snow.worker.js';

const page = document.body.clientHeight;
const pageHeight = document.body.offsetHeight;

const snowflakesActive = 1000;
const snowflakesLifetime = 1000;
let snowWorker;

const snowCanvas = document.createElement('canvas');
snowCanvas.style.position = 'fixed';
snowCanvas.style.top = '0';
snowCanvas.style.left = '0';
snowCanvas.width = document.body.clientWidth;
snowCanvas.height = document.body.clientHeight;
snowCanvas.style['pointer-events'] = 'none';
document.body.appendChild(snowCanvas);

const ctx = snowCanvas.getContext('2d');
ctx.fillStyle = 'white';

if (window.Worker) {
    snowWorker = new SnowWorker();
    snowWorker.onmessage = function(e) {
        draw(e.data.snowflakes, e.data.snowflakesStatic);
    }
    snowWorker.postMessage({
        type: 'init',
        active: snowflakesActive,
        width: snowCanvas.width,
        height: pageHeight
    });
} else {
    console.log("Snowfall requires webworkers because reasons.");
}

const screenMap = () => {
    let rooftops = document.querySelectorAll('.rooftop');
    let platforms = [];
    rooftops.forEach((rooftopEl) => {
        let bounds = rooftopEl.getClientRects();
        platforms.push({ left: bounds[0].left, width: bounds[0].width, top: bounds[0].top });
    });
    snowWorker.postMessage({
        type: 'screenmap',
        platforms: platforms
    });
}

const draw = (snowflakes, snowflakesStatic) => {

    ctx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);

    snowflakesStatic.forEach((f) => {
        ctx.beginPath();
        ctx.arc(f.x, f.y-document.body.scrollTop, f.s, 0, 2 * Math.PI, false);
        ctx.fill();
    });

    snowflakes.forEach((f) => {
        ctx.beginPath();
        ctx.arc(f.x, f.y-document.body.scrollTop, f.s, 0, 2 * Math.PI, false);
        ctx.fill();
    });

}

window.addEventListener('resize', screenMap);

screenMap();
