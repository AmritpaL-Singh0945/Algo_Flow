// js/app_search.js

const viz = new SearchVisualizer('viz-container');
let currentArray = [];
let currentTarget = null;
let worker = null;

let allSteps = [];
let currentStepIndex = 0;
let isPlaying = false;
let animationTimeout = null;

const inputCustom = document.getElementById('custom-array');
const inputTarget = document.getElementById('target-value');
const btnSet = document.getElementById('btn-set-custom');
const btnRandom = document.getElementById('btn-random');
const btnStart = document.getElementById('btn-start');
const speedSlider = document.getElementById('speed-slider');
const speedDisplay = document.getElementById('speed-display');
const statusDisplay = document.getElementById('status-display');

const btnPrev = document.getElementById('btn-prev');
const btnPause = document.getElementById('btn-pause');
const btnNext = document.getElementById('btn-next');

function initArray(size = 10) {
    currentArray = [];
    for (let i = 0; i < size; i++) {
        currentArray.push(Math.floor(Math.random() * 90) + 10);
    }
    currentArray.sort((a, b) => a - b);
    currentTarget = currentArray[Math.floor(Math.random() * currentArray.length)];
    
    inputTarget.value = currentTarget;
    stopPlayback();
    updateStatus("DATA LOADED");
    viz.render(currentArray, 0, currentArray.length - 1, null, 'init');
}

speedSlider.addEventListener('input', (e) => {
    speedDisplay.textContent = `${e.target.value}ms`;
});

btnSet.addEventListener('click', () => {
    const raw = inputCustom.value;
    if (!raw) return;
    const parsed = raw.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n)).slice(0, 10);
    if (parsed.length > 0) {
        parsed.sort((a, b) => a - b);
        currentArray = parsed;
        inputCustom.value = currentArray.join(', ');
        stopPlayback();
        updateStatus("DATA LOADED (SORTED)");
        viz.render(currentArray, 0, currentArray.length - 1, null, 'init');
    }
});

btnRandom.addEventListener('click', () => {
    initArray();
    inputCustom.value = currentArray.join(', ');
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
        viz.render(step.array, step.left, step.right, step.mid, step.type);
        updateStatus(step.msg);
    } else {
        viz.render(currentArray, 0, currentArray.length - 1, null, 'init');
        updateStatus("READY");
    }
});

btnNext.addEventListener('click', () => {
    if (allSteps.length === 0) return;
    stopPlayback(); 
    
    if (currentStepIndex < allSteps.length - 1) {
        currentStepIndex++;
        const step = allSteps[currentStepIndex];
        viz.render(step.array, step.left, step.right, step.mid, step.type);
        updateStatus(step.msg);
    }
});

btnStart.addEventListener('click', () => {
    const targetVal = parseInt(inputTarget.value, 10);
    if (isNaN(targetVal)) {
        updateStatus("INVALID TARGET");
        return;
    }

    stopPlayback();
    if (worker) worker.terminate();

    btnStart.textContent = 'COMPUTING...';
    btnStart.disabled = true;
    setPlaybackButtonsDisabled(true);
    updateStatus("INITIALIZING WORKER...");

    worker = new Worker('js/workers/worker_search.js');
    
    worker.postMessage({
        array: currentArray,
        target: targetVal
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
    viz.render(step.array, step.left, step.right, step.mid, step.type);
    updateStatus(step.msg);
    
    currentStepIndex++;
    const delay = parseInt(speedSlider.value, 10);
    
    if (currentStepIndex < allSteps.length) {
        animationTimeout = setTimeout(renderLoop, delay);
    } else {
        stopPlayback();
    }
}

initArray();
inputCustom.value = currentArray.join(', ');