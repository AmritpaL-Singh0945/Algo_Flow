const viz = new DpVisualizer('viz-container');
let worker = null;

let currentWeights = [];
let currentValues = [];
let currentCapacity = 0;

let allSteps = [];
let currentStepIndex = 0;
let isPlaying = false;
let animationTimeout = null;

const inputWeights = document.getElementById('weights-input');
const inputValues = document.getElementById('values-input');
const inputCapacity = document.getElementById('capacity-input');
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

function initData(wText, vText, cap) {
    inputWeights.value = wText;
    inputValues.value = vText;
    inputCapacity.value = cap;

    currentWeights = parseCSV(wText);
    currentValues = parseCSV(vText);
    currentCapacity = parseInt(cap, 10);
    
    const matrix = Array(currentWeights.length + 1).fill().map(() => Array(currentCapacity + 1).fill(null));
    
    stopPlayback();
    updateStatus("DATA LOADED - READY");
    viz.render({ mode: 'table', matrix: matrix, active: null, compare: [], path: [] }, currentWeights, currentValues, currentCapacity);
}

speedSlider.addEventListener('input', (e) => {
    speedDisplay.textContent = `${e.target.value}ms`;
});

btnSet.addEventListener('click', () => {
    const w = inputWeights.value.split(',').slice(0,10).join(', ');
    const v = inputValues.value.split(',').slice(0,10).join(', ');
    const c = inputCapacity.value;
    if (w && v && c) {
        inputWeights.value = w;
        inputValues.value = v;
        initData(w, v, c);
    }
});

btnRandom.addEventListener('click', () => {
    const randW = [];
    const randV = [];
    const isMemo = selectAlgo.value.includes('memo');
    const limit = isMemo ? 4 : 8; 
    
    for(let i=0; i<limit; i++) {
        randW.push(Math.floor(Math.random() * 5) + 1);
        randV.push(Math.floor(Math.random() * 50) + 10);
    }
    const cap = Math.floor(Math.random() * 8) + 6;
    initData(randW.join(', '), randV.join(', '), cap);
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
        viz.render(step, currentWeights, currentValues, currentCapacity);
        updateStatus(step.msg);
    }
});

btnNext.addEventListener('click', () => {
    if (allSteps.length === 0) return;
    stopPlayback(); 
    
    if (currentStepIndex < allSteps.length - 1) {
        currentStepIndex++;
        const step = allSteps[currentStepIndex];
        viz.render(step, currentWeights, currentValues, currentCapacity);
        updateStatus(step.msg);
    }
});

btnStart.addEventListener('click', () => {
    currentWeights = parseCSV(inputWeights.value);
    currentValues = parseCSV(inputValues.value);
    currentCapacity = parseInt(inputCapacity.value, 10);

    if (currentWeights.length !== currentValues.length || isNaN(currentCapacity)) {
        updateStatus("INPUT ERROR: W/V LENGTH MISMATCH");
        return;
    }

    if (currentCapacity > 40) {
        updateStatus("ERROR: MAX CAPACITY CAPPED AT 40");
        return;
    }

    const isMemo = selectAlgo.value.includes('memo');
    
    if (isMemo && currentWeights.length > 5) {
        updateStatus("ERROR: TREE MODE LIMITED TO 5 ITEMS");
        return;
    } else if (!isMemo && currentWeights.length > 10) {
        updateStatus("ERROR: TABLE MODE LIMITED TO 10 ITEMS");
        return;
    }

    stopPlayback();
    if (worker) worker.terminate();

    btnStart.textContent = 'COMPUTING...';
    btnStart.disabled = true;
    setPlaybackButtonsDisabled(true);
    updateStatus("INITIALIZING WORKER...");

    worker = new Worker('js/workers/worker_dp.js');
    
    worker.postMessage({
        weights: currentWeights,
        values: currentValues,
        capacity: currentCapacity,
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
    viz.render(step, currentWeights, currentValues, currentCapacity);
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
        initData("2, 3, 4", "3, 4, 5", 5);
    }, 50);
});