function TwoPointerVisualizer(containerId) {
    this.container = document.getElementById(containerId);
}

TwoPointerVisualizer.prototype.render = function(step) {
    this.container.innerHTML = '';
    if (!step || !step.array) return;

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < step.array.length; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'tp-block-wrapper';

        const block = document.createElement('div');
        block.className = 'tp-block';
        block.textContent = step.array[i];

        if (step.activeIndices && step.activeIndices.includes(i)) {
            block.classList.add(step.type === 'swap' ? 'state-swap' : 'state-compare');
        }

        if (step.successIndices && step.successIndices.includes(i)) {
            block.classList.add('state-success');
        }

        wrapper.appendChild(block);

        if (step.pointers) {
            for (const ptrName in step.pointers) {
                if (step.pointers[ptrName] === i) {
                    const badge = document.createElement('div');
                    badge.className = 'pointer-badge';
                    badge.textContent = ptrName.toUpperCase();
                    if (ptrName === 'left' || ptrName === 'i') {
                        badge.classList.add('pointer-badge-top');
                    }
                    wrapper.appendChild(badge);
                }
            }
        }

        fragment.appendChild(wrapper);
    }

    this.container.appendChild(fragment);
};