const viz = new TreeVisualizer('viz-container');
let currentArray = [];
let worker = null;

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

function initArray() {
    currentArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    currentArray = currentArray.sort(() => Math.random() - 0.5).slice(0, 10);
    
    inputCustom.value = currentArray.join(', ');
    stopPlayback();
    updateStatus("TREE BUILT");
    
    setTimeout(() => {
        viz.render(currentArray, null, []);
    }, 100);
}

speedSlider.addEventListener('input', (e) => {
    speedDisplay.textContent = `${e.target.value}ms`;
});

btnSet.addEventListener('click', () => {
    const raw = inputCustom.value;
    if (!raw) return;
    
    const parsed = raw.split(',').map(n => {
        const trimmed = n.trim();
        if (trimmed.toLowerCase() === 'null') return null;
        return isNaN(parseInt(trimmed, 10)) ? null : parseInt(trimmed, 10);
    }).slice(0, 10);

    if (parsed.length > 0) {
        currentArray = parsed;
        inputCustom.value = currentArray.join(', ');
        stopPlayback();
        updateStatus("TREE BUILT");
        viz.render(currentArray, null, []);
    }
});

btnRandom.addEventListener('click', () => {
    initArray();
});

window.addEventListener('resize', () => {
    if (!isPlaying && allSteps.length === 0) {
        viz.render(currentArray, null, []);
    } else if (allSteps.length > 0 && currentStepIndex < allSteps.length) {
        const step = allSteps[currentStepIndex];
        viz.render(step.array, step.visiting, step.visited);
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
        viz.render(step.array, step.visiting, step.visited);
        updateStatus(step.msg);
    } else {
        viz.render(currentArray, null, []);
        updateStatus("READY");
    }
});

btnNext.addEventListener('click', () => {
    if (allSteps.length === 0) return;
    stopPlayback(); 
    
    if (currentStepIndex < allSteps.length - 1) {
        currentStepIndex++;
        const step = allSteps[currentStepIndex];
        viz.render(step.array, step.visiting, step.visited);
        updateStatus(step.msg);
    } else if (currentStepIndex === allSteps.length - 1) {
        viz.render(currentArray, null, null, true);
        updateStatus("TRAVERSAL COMPLETE");
    }
});

btnStart.addEventListener('click', () => {
    stopPlayback();
    if (worker) worker.terminate();

    btnStart.textContent = 'COMPUTING...';
    btnStart.disabled = true;
    setPlaybackButtonsDisabled(true);
    updateStatus("INITIALIZING WORKER...");

    worker = new Worker('js/workers/worker_tree.js');
    
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
        viz.render(currentArray, null, null, true);
        updateStatus("TRAVERSAL COMPLETE");
        return;
    }
    
    const step = allSteps[currentStepIndex];
    viz.render(step.array, step.visiting, step.visited);
    updateStatus(step.msg);
    
    currentStepIndex++;
    const delay = parseInt(speedSlider.value, 10);
    
    if (currentStepIndex < allSteps.length) {
        animationTimeout = setTimeout(renderLoop, delay);
    } else {
        setTimeout(() => {
            stopPlayback();
            viz.render(currentArray, null, null, true);
            updateStatus("TRAVERSAL COMPLETE");
        }, delay);
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
        initArray();
    }, 50);
});