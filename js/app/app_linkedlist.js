const viz = new LinkedListVisualizer('viz-container');
let worker = null;

let currentArray = [];
let allSteps = [];
let currentStepIndex = 0;
let isPlaying = false;
let animationTimeout = null;

const inputCustom = document.getElementById('custom-array');
const btnSet = document.getElementById('btn-set-custom');
const btnRandom = document.getElementById('btn-random');
const selectAlgo = document.getElementById('algo-select');
const btnStart = document.getElementById('btn-start');
const speedSlider = document.getElementById('speed-slider');
const speedDisplay = document.getElementById('speed-display');
const statusDisplay = document.getElementById('status-display');

const btnPrev = document.getElementById('btn-prev');
const btnPause = document.getElementById('btn-pause');
const btnNext = document.getElementById('btn-next');

function parseCSV(val) {
    return val.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n)).slice(0, 10);
}

function buildInitialLinks(len) {
    const links = [];
    for (let i = 0; i < len; i++) {
        links.push(i === len - 1 ? null : i + 1);
    }
    return links;
}

function initData(arrStr) {
    inputCustom.value = arrStr;
    currentArray = parseCSV(arrStr);
    
    stopPlayback();
    updateStatus("LIST CONSTRUCTED");
    
    viz.render({
        array: currentArray,
        links: buildInitialLinks(currentArray.length),
        pointers: { head: 0 }
    });
}

speedSlider.addEventListener('input', (e) => {
    speedDisplay.textContent = `${e.target.value}ms`;
});

btnSet.addEventListener('click', () => {
    const str = inputCustom.value;
    if (str) {
        const sliced = str.split(',').slice(0,10).join(', ');
        inputCustom.value = sliced;
        initData(sliced);
    }
});

btnRandom.addEventListener('click', () => {
    const randArr = [];
    const len = Math.floor(Math.random() * 4) + 5; 
    for(let i=0; i<len; i++) {
        randArr.push(Math.floor(Math.random() * 90) + 10);
    }
    initData(randArr.join(', '));
});

window.addEventListener('resize', () => {
    if (!isPlaying && allSteps.length === 0) {
        viz.render({
            array: currentArray,
            links: buildInitialLinks(currentArray.length),
            pointers: { head: 0 }
        });
    } else if (allSteps.length > 0 && currentStepIndex < allSteps.length) {
        viz.render(allSteps[currentStepIndex]);
    }
});

function setPlaybackButtonsDisabled(disabled) {
    btnPrev.disabled = disabled;
    btnPause.disabled = disabled;
    btnNext.disabled = disabled;
}

function stopPlayback() {
    isPlaying = false;
    if (animationTimeout) clearTimeout(animationTimeout);
    btnPause.textContent = '►';
}

function startPlayback() {
    isPlaying = true;
    btnPause.textContent = '||';
    renderLoop();
}

function updateStatus(msg) {
    statusDisplay.textContent = msg;
}

btnPause.addEventListener('click', () => {
    if (allSteps.length === 0) return;
    if (isPlaying) {
        stopPlayback();
    } else {
        startPlayback();
    }
});

btnPrev.addEventListener('click', () => {
    if (allSteps.length === 0) return;
    stopPlayback(); 
    
    if (currentStepIndex > 0) {
        currentStepIndex--;
        const step = allSteps[currentStepIndex];
        viz.render(step);
        updateStatus(step.msg);
    }
});

btnNext.addEventListener('click', () => {
    if (allSteps.length === 0) return;
    stopPlayback(); 
    
    if (currentStepIndex < allSteps.length - 1) {
        currentStepIndex++;
        const step = allSteps[currentStepIndex];
        viz.render(step);
        updateStatus(step.msg);
    }
});

btnStart.addEventListener('click', () => {
    currentArray = parseCSV(inputCustom.value);

    if (currentArray.length < 2) {
        updateStatus("ERROR: REQUIRE AT LEAST 2 NODES");
        return;
    }
    
    if (currentArray.length > 10) {
        updateStatus("ERROR: MAX 10 NODES ALLOWED");
        return;
    }

    stopPlayback();
    if (worker) worker.terminate();

    btnStart.textContent = 'COMPUTING...';
    btnStart.disabled = true;
    setPlaybackButtonsDisabled(true);
    updateStatus("INITIALIZING WORKER...");

    worker = new Worker('js/workers/worker_linkedlist.js');
    
    worker.postMessage({
        array: currentArray,
        algo: selectAlgo.value
    });

    worker.onmessage = function(e) {
        allSteps = e.data;
        currentStepIndex = 0;
        
        btnStart.textContent = 'RESTART';
        btnStart.disabled = false;
        setPlaybackButtonsDisabled(false);
        
        startPlayback();
    };
});

function renderLoop() {
    if (!isPlaying) return;

    if (currentStepIndex >= allSteps.length) {
        stopPlayback();
        return;
    }
    
    const step = allSteps[currentStepIndex];
    viz.render(step);
    updateStatus(step.msg);
    
    currentStepIndex++;
    const delay = parseInt(speedSlider.value, 10);
    
    if (currentStepIndex < allSteps.length) {
        animationTimeout = setTimeout(renderLoop, delay);
    } else {
        stopPlayback();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const algoParam = urlParams.get('algo');
    
    if (algoParam) {
        const optionExists = Array.from(selectAlgo.options).some(opt => opt.value === algoParam);
        if (optionExists) {
            selectAlgo.value = algoParam;
        }
    }
    
    setTimeout(() => {
        initData("10, 20, 30, 40, 50, 60");
    }, 100);
});