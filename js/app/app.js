const viz = new BaseVisualizer('viz-container');
let currentArray = [];
let worker = null;

let allSteps = [];
let currentStepIndex = 0;
let isPlaying = false;
let animationTimeout = null;

const inputCustom = document.getElementById('custom-array');
const btnSet = document.getElementById('btn-set-custom');
const btnRandom = document.getElementById('btn-random');
const btnModeBars = document.getElementById('btn-mode-bars');
const btnModeBlocks = document.getElementById('btn-mode-blocks');
const selectAlgo = document.getElementById('algo-select');
const btnStart = document.getElementById('btn-start');
const speedSlider = document.getElementById('speed-slider');
const speedDisplay = document.getElementById('speed-display');

const btnPrev = document.getElementById('btn-prev');
const btnPause = document.getElementById('btn-pause');
const btnNext = document.getElementById('btn-next');

function initArray(size = 10) {
    currentArray = [];
    for (let i = 0; i < size; i++) {
        currentArray.push(Math.floor(Math.random() * 90) + 10);
    }
    stopPlayback();
    viz.render(currentArray, []);
}

speedSlider.addEventListener('input', (e) => {
    speedDisplay.textContent = `${e.target.value}ms`;
});

btnSet.addEventListener('click', () => {
    const raw = inputCustom.value;
    if (!raw) return;
    const parsed = raw.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n)).slice(0, 10);
    if (parsed.length > 0) {
        currentArray = parsed;
        inputCustom.value = currentArray.join(', ');
        stopPlayback();
        viz.render(currentArray, []);
    }
});

btnRandom.addEventListener('click', () => {
    initArray();
    inputCustom.value = currentArray.join(', ');
});

btnModeBars.addEventListener('click', () => {
    btnModeBars.classList.add('active-mode');
    btnModeBlocks.classList.remove('active-mode');
    viz.setMode('bars');
});

btnModeBlocks.addEventListener('click', () => {
    btnModeBlocks.classList.add('active-mode');
    btnModeBars.classList.remove('active-mode');
    viz.setMode('blocks');
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
        viz.render(step.array, step.indices, step.type);
    } else {
        viz.render(currentArray, []);
    }
});

btnNext.addEventListener('click', () => {
    if (allSteps.length === 0) return;
    stopPlayback(); 
    
    if (currentStepIndex < allSteps.length - 1) {
        currentStepIndex++;
        const step = allSteps[currentStepIndex];
        viz.render(step.array, step.indices, step.type);
    } else if (currentStepIndex === allSteps.length - 1) {
        currentStepIndex++;
        viz.render(allSteps[allSteps.length - 1].array, [], 'success');
    }
});

btnStart.addEventListener('click', () => {
    stopPlayback();
    if (worker) worker.terminate();

    btnStart.textContent = 'COMPUTING...';
    btnStart.disabled = true;
    setPlaybackButtonsDisabled(true);

    worker = new Worker('js/workers/worker_array.js');
    
    worker.postMessage({
        algo: selectAlgo.value,
        array: currentArray
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
        playSuccessAnimation(allSteps[allSteps.length - 1].array);
        return;
    }
    
    const step = allSteps[currentStepIndex];
    viz.render(step.array, step.indices, step.type);
    
    currentStepIndex++;
    const delay = parseInt(speedSlider.value, 10);
    animationTimeout = setTimeout(renderLoop, delay);
}

function playSuccessAnimation(finalArray) {
    let index = 0;
    isPlaying = false;
    btnPause.textContent = '►';
    
    function sweep() {
        if (index > finalArray.length) {
            btnStart.textContent = 'START WORKER';
            btnStart.disabled = false;
            return;
        }
        
        const activeIndices = [];
        for (let j = 0; j < index; j++) {
            activeIndices.push(j);
        }
        
        viz.render(finalArray, activeIndices, 'success');
        index++;
        animationTimeout = setTimeout(sweep, 40);
    }
    
    sweep();
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
});

initArray();
inputCustom.value = currentArray.join(', ');