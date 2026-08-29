// js/SearchVisualizer.js

function SearchVisualizer(containerId) {
    this.container = document.getElementById(containerId);
    this.array = [];
}

SearchVisualizer.prototype.render = function(array, left, right, mid, type) {
    this.array = array;
    this.container.innerHTML = '';
    
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < this.array.length; i++) {
        const val = this.array[i];
        const block = document.createElement('div');
        block.className = 'viz-block';
        block.textContent = val;
        
        if (left !== null && right !== null && (i < left || i > right)) {
            block.classList.add('state-discarded');
        }
        
        if (i === left && i === right) {
            block.classList.add('pointer-lr');
        } else {
            if (i === left) block.classList.add('pointer-l');
            if (i === right) block.classList.add('pointer-r');
        }

        if (i === mid) {
            block.classList.add('state-mid');
            block.classList.add('pointer-m');
        }

        if (type === 'found' && i === mid) {
            block.className = 'viz-block state-success pointer-m';
        }
        
        if (type === 'not-found') {
            block.classList.add('state-discarded');
        }

        fragment.appendChild(block);
    }
    
    this.container.appendChild(fragment);
};