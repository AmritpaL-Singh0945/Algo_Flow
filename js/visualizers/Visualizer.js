function BaseVisualizer(containerId) {
    this.container = document.getElementById(containerId);
    this.mode = 'bars';
    this.array = [];
    this.maxVal = 1;
}

BaseVisualizer.prototype.setMode = function(newMode) {
    this.mode = newMode;
    this.render(this.array, []);
};

BaseVisualizer.prototype.render = function(array, activeIndices, stateType) {
    this.array = array;
    this.maxVal = Math.max(...array);
    this.container.innerHTML = '';
    
    if (this.mode === 'bars') {
        this.container.className = 'viz-container';
        this.renderBars(activeIndices, stateType);
    } else {
        this.container.className = 'viz-container viz-mode-blocks';
        this.renderBlocks(activeIndices, stateType);
    }
};

BaseVisualizer.prototype.renderBars = function(activeIndices, stateType) {
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < this.array.length; i++) {
        const val = this.array[i];
        
        const wrapper = document.createElement('div');
        wrapper.className = 'bar-wrapper';

        const bar = document.createElement('div');
        bar.className = 'viz-bar';
        
        const heightPct = (val / this.maxVal) * 85;
        bar.style.height = `${Math.max(5, heightPct)}%`;
        
        if (activeIndices && activeIndices.includes(i)) {
            bar.classList.add(`state-${stateType}`);
        }
        
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = val;

        wrapper.appendChild(bar);
        wrapper.appendChild(label);
        fragment.appendChild(wrapper);
    }
    this.container.appendChild(fragment);
};

BaseVisualizer.prototype.renderBlocks = function(activeIndices, stateType) {
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < this.array.length; i++) {
        const val = this.array[i];
        const block = document.createElement('div');
        block.className = 'viz-block';
        block.textContent = val;
        
        if (activeIndices && activeIndices.includes(i)) {
            block.classList.add(`state-${stateType}`);
        }
        
        fragment.appendChild(block);
    }
    this.container.appendChild(fragment);
};