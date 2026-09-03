const viz = new TwoPointerVisualizer('viz-container');
let worker = null;

let currentData = [];
let allSteps = [];
let currentStepIndex = 0;
let isPlaying = false;
let animationTimeout = null;

const inputCustom = document.getElementById('custom-array');
const inputTarget = document.getElementById('target-value');
const targetGroup = document.getElementById('target-group');
const inputLabel = document.getElementById('input-label');
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

function updateUIFields() {
    const algo = selectAlgo.value;
    if (algo === 'palindrome') {
        inputLabel.textContent = "INPUT STRING";
        inputCustom.placeholder = "A man a plan a canal Panama";
        targetGroup.style.display = 'none';
    } else if (algo === 'twosum') {
        inputLabel.textContent = "SORTED NUMBERS (COMMA SEPARATED)";
        inputCustom.placeholder = "2, 7, 11, 15";
        targetGroup.style.display = 'flex';
        if (!inputTarget.value) inputTarget.value = "9";
    } else {
        inputLabel.textContent = "INPUT DATA (COMMA SEPARATED)";
        inputCustom.placeholder = "1, 2, 3, 4, 5";
        targetGroup.style.display = 'none';
    }
}

selectAlgo.addEventListener('change', () => {
    updateUIFields();
    initDefaultData();
});

function initDefaultData() {
    const algo = selectAlgo.value;
    if (algo === 'palindrome') {
        currentData = "racecar".split('');
        inputCustom.value = currentData.join('');
    } else if (algo === 'twosum') {
        currentData = [2, 7, 11, 15, 20];
        inputCustom.value = currentData.join(', ');
        inputTarget.value = "9";
    } else {
        currentData = [12, 25, 38, 44, 59, 72, 86];
        inputCustom.value = currentData.join(', ');
    }
    stopPlayback();
    updateStatus("DATA LOADED");
    viz.render({ array: currentData, pointers: {} });
}

speedSlider.addEventListener('input', (e) => {
    speedDisplay.textContent = `${e.target.value}ms`;
});

btnSet.addEventListener('click', () => {
    const val = inputCustom.value;
    if (!val) return;
    
    if (selectAlgo.value === 'palindrome') {
        currentData = val.split('');
    } else {
        currentData = val.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n)).slice(0, 10);
        if (selectAlgo.value === 'twosum') {
            currentData.sort((a, b) => a - b);
        }
        inputCustom.value = currentData.join(', ');
    }

    stopPlayback();
    updateStatus("DATA LOADED");
    viz.render({ array: currentData, pointers: {} });
});

btnRandom.addEventListener('click', () => {
    initDefaultData();
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
    stopPlayback();
    if (worker) worker.terminate();

    btnStart.textContent = 'COMPUTING...';
    btnStart.disabled = true;
    setPlaybackButtonsDisabled(true);
    updateStatus("INITIALIZING WORKER...");

    worker = new Worker('js/workers/worker_twopointers.js');
    
    worker.postMessage({
        algo: selectAlgo.value,
        array: currentData,
        arrayStr: inputCustom.value,
        target: parseInt(inputTarget.value, 10)
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
    
    updateUIFields();
    initDefaultData();
});