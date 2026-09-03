const viz = new GraphVisualizer('viz-container');
let worker = null;

let allSteps = [];
let currentStepIndex = 0;
let isPlaying = false;
let animationTimeout = null;

const inputCustom = document.getElementById('custom-graph');
const inputStartNode = document.getElementById('start-node');
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

const defaultGraph = "A-B:4, A-C:2, B-C:1, B-D:5, C-D:8, C-E:10, D-E:2, D-Z:6, E-Z:3";
const randomGraphs = [
    "X-Y:5, Y-Z:2, X-W:1, W-Z:8",
    "1-2:10, 1-3:5, 3-2:3, 2-4:1, 4-5:2",
    "A-B:1, B-C:1, C-D:1, D-A:1, A-C:1"
];

function initGraph(graphString) {
    inputCustom.value = graphString;
    viz.parseGraph(graphString);
    
    if (viz.nodes.length > 0) {
        inputStartNode.value = viz.nodes[0];
    }
    
    stopPlayback();
    updateStatus("GRAPH BUILT");
    viz.render(null, [], null);
}

speedSlider.addEventListener('input', (e) => {
    speedDisplay.textContent = `${e.target.value}ms`;
});

btnSet.addEventListener('click', () => {
    const raw = inputCustom.value;
    if (!raw) return;
    const sliced = raw.split(',').slice(0,10).join(', ');
    inputCustom.value = sliced;
    initGraph(sliced);
});

btnRandom.addEventListener('click', () => {
    const randomG = randomGraphs[Math.floor(Math.random() * randomGraphs.length)];
    initGraph(randomG);
});

window.addEventListener('resize', () => {
    viz.calculateLayout();
    if (!isPlaying && allSteps.length === 0) {
        viz.render(null, [], null);
    } else if (allSteps.length > 0 && currentStepIndex < allSteps.length) {
        const step = allSteps[currentStepIndex];
        viz.render(step.visiting, step.visited, step.distances, false, step.activeEdges);
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
        viz.render(step.visiting, step.visited, step.distances, false, step.activeEdges);
        updateStatus(step.msg);
    } else {
        viz.render(null, [], null);
        updateStatus("READY");
    }
});

btnNext.addEventListener('click', () => {
    if (allSteps.length === 0) return;
    stopPlayback(); 
    
    if (currentStepIndex < allSteps.length - 1) {
        currentStepIndex++;
        const step = allSteps[currentStepIndex];
        viz.render(step.visiting, step.visited, step.distances, false, step.activeEdges);
        updateStatus(step.msg);
    } else if (currentStepIndex === allSteps.length - 1) {
        viz.render(null, allSteps[allSteps.length - 1].visited, allSteps[allSteps.length - 1].distances, true);
        updateStatus("ALGORITHM COMPLETE");
    }
});

btnStart.addEventListener('click', () => {
    const startNode = inputStartNode.value.trim();
    if (!viz.nodes.includes(startNode)) {
        updateStatus("INVALID START NODE");
        return;
    }

    stopPlayback();
    if (worker) worker.terminate();

    btnStart.textContent = 'COMPUTING...';
    btnStart.disabled = true;
    setPlaybackButtonsDisabled(true);
    updateStatus("INITIALIZING WORKER...");

    worker = new Worker('js/workers/worker_graph.js');
    
    worker.postMessage({
        nodes: viz.nodes,
        edges: viz.edges,
        startNode: startNode,
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
        viz.render(null, allSteps[allSteps.length - 1].visited, allSteps[allSteps.length - 1].distances, true);
        updateStatus("ALGORITHM COMPLETE");
        return;
    }
    
    const step = allSteps[currentStepIndex];
    viz.render(step.visiting, step.visited, step.distances, false, step.activeEdges);
    updateStatus(step.msg);
    
    currentStepIndex++;
    const delay = parseInt(speedSlider.value, 10);
    
    if (currentStepIndex < allSteps.length) {
        animationTimeout = setTimeout(renderLoop, delay);
    } else {
        setTimeout(() => {
            stopPlayback();
            viz.render(null, allSteps[allSteps.length - 1].visited, allSteps[allSteps.length - 1].distances, true);
            updateStatus("ALGORITHM COMPLETE");
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
        initGraph(defaultGraph);
    }, 50);
});