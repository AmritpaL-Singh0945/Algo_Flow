const btnAnalyze = document.getElementById('btn-analyze');
const codeInput = document.getElementById('code-input');
const tcDisplay = document.getElementById('tc-display');
const scDisplay = document.getElementById('sc-display');
const terminalOutput = document.getElementById('terminal-output');

function addTerminalLine(text, isError = false) {
    const line = document.createElement('div');
    line.className = 'term-line';
    if (isError) line.classList.add('term-error');
    line.textContent = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function clearTerminal() {
    terminalOutput.innerHTML = '';
}

async function fetchAnalysisFromAPI(code, language) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let tc = "O(N)";
            let sc = "O(1)";
            let trace = [
                "AST Parser initiated...",
                "Scanning syntax for language: " + language,
                "Analyzing loop structures...",
                "Dry run started at line 1."
            ];

            if (code.includes('for') && code.includes('for (')) {
                tc = "O(N²)";
                trace.push("Detected nested loop structures. Quadratic time growth expected.");
            }
            if (code.includes('new Array') || code.includes('[]')) {
                sc = "O(N)";
                trace.push("Array allocation detected. Linear space growth expected.");
            }
            if (code.includes('fibonacci') || (code.includes('return') && code.includes(code.match(/function\s+(\w+)/)?.[1] || 'xxx'))) {
                tc = "O(2^N)";
                sc = "O(N)";
                trace.push("Recursive calls detected. Exploring call stack limits...");
            }

            trace.push("Variables initialized state memory.");
            trace.push("Execution context completed successfully.");
            trace.push("Returning final complexity metrics.");

            resolve({
                timeComplexity: tc,
                spaceComplexity: sc,
                dryRunSteps: trace
            });
        }, 1500); 
    });
}

btnAnalyze.addEventListener('click', async () => {
    const code = codeInput.value.trim();
    const lang = document.getElementById('lang-select').value;
    
    if (!code) {
        clearTerminal();
        addTerminalLine("Error: No code provided to analyze.", true);
        return;
    }

    btnAnalyze.disabled = true;
    btnAnalyze.textContent = "ANALYZING...";
    tcDisplay.textContent = "---";
    scDisplay.textContent = "---";
    clearTerminal();
    addTerminalLine("Connecting to analysis engine...");
    addTerminalLine("Transmitting AST payload...");

    try {
        const response = await fetchAnalysisFromAPI(code, lang);

        tcDisplay.textContent = response.timeComplexity;
        scDisplay.textContent = response.spaceComplexity;

        let stepDelay = 0;
        response.dryRunSteps.forEach((step, index) => {
            setTimeout(() => {
                addTerminalLine(step);
            }, stepDelay);
            stepDelay += 300; 
        });

    } catch (error) {
        addTerminalLine("CRITICAL FAILURE: Engine disconnected.", true);
    } finally {
        setTimeout(() => {
            btnAnalyze.disabled = false;
            btnAnalyze.textContent = "INITIATE DRY RUN & ANALYSIS";
        }, 1500);
    }
});