function buildGrid() {
    const puzzleWrapper = document.getElementById('puzzle');
    puzzleWrapper.innerHTML = ''; // Clear

    const cellSize = 40;
    const svgNS = "http://www.w3.org/2000/svg";

    // Create container for SVG + inputs (relative parent)
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = (crossword.width * cellSize) + 'px';
    container.style.height = (crossword.height * cellSize) + 'px';
    container.style.margin = 'auto';

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", crossword.width * cellSize);
    svg.setAttribute("height", crossword.height * cellSize);

    // First: draw non-blocked rectangles
for (let row = 0; row < crossword.height; row++) {
    for (let col = 0; col < crossword.width; col++) {
        const isBlocked = crossword.blocks.some(([r, c]) => r === row && c === col);
        if (!isBlocked) {
            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", col * cellSize);
            rect.setAttribute("y", row * cellSize);
            rect.setAttribute("width", cellSize);
            rect.setAttribute("height", cellSize);
            rect.setAttribute("fill", "white");
            rect.setAttribute("stroke", "#333");
            rect.setAttribute("stroke-width", "1");
            svg.appendChild(rect);
        }
    }
}

// Second: draw transparent blocked rectangles
for (let row = 0; row < crossword.height; row++) {
    for (let col = 0; col < crossword.width; col++) {
        const isBlocked = crossword.blocks.some(([r, c]) => r === row && c === col);
        if (isBlocked) {
            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", col * cellSize);
            rect.setAttribute("y", row * cellSize);
            rect.setAttribute("width", cellSize);
            rect.setAttribute("height", cellSize);
            rect.setAttribute("fill", "transparent");
            rect.setAttribute("stroke", "none");
            svg.appendChild(rect);
        }




            // Render solution map letters (blue labels)
            for (const [letter, pos] of Object.entries(crossword.solutionMap)) {
                if (pos[0] === row && pos[1] === col) {
                    const sol = document.createElementNS(svgNS, "text");
                    sol.setAttribute("x", (col + 1) * cellSize - 6);
                    sol.setAttribute("y", (row + 1) * cellSize - 5);
                    sol.setAttribute("font-size", "14px");
                    sol.setAttribute("fill", "#003399");
                    sol.setAttribute("font-weight", "900");
                    sol.setAttribute("text-anchor", "end");
                    sol.textContent = letter;
                    svg.appendChild(sol);
                }
            }
        }
    }

    container.appendChild(svg);
    puzzleWrapper.appendChild(container);

    createInputs(container, cellSize);
    buildSolutionRow();
    checkSolution();
}

// Build input fields over the SVG grid
function createInputs(container, cellSize) {
    const inputLayer = document.createElement('div');
    inputLayer.style.position = 'absolute';
    inputLayer.style.top = '0';
    inputLayer.style.left = '0';
    inputLayer.style.width = '100%';
    inputLayer.style.height = '100%';

    for (let row = 0; row < crossword.height; row++) {
        for (let col = 0; col < crossword.width; col++) {
            const isBlocked = crossword.blocks.some(([r, c]) => r === row && c === col);
            if (!isBlocked) {
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.dataset.row = row;
                input.dataset.col = col;

                input.style.position = 'absolute';
                input.style.left = `${col * cellSize}px`;
                input.style.top = `${row * cellSize}px`;
                input.style.width = `${cellSize}px`;
                input.style.height = `${cellSize}px`;
                input.style.textAlign = 'center';
                input.style.fontSize = '18px';
                input.style.fontWeight = 'bold';
                input.style.border = 'none';
                input.style.outline = 'none';
                input.style.background = 'transparent';

                input.addEventListener('input', (e) => {
                    if (e.target.value.length === 1) {
                        moveToNextInput(e.target);
                    }
                    checkSolution();
                });

                inputLayer.appendChild(input);
            }
        }
    }

    container.appendChild(inputLayer);
}

// Auto-advance logic
function moveToNextInput(currentInput) {
    const row = parseInt(currentInput.dataset.row);
    const col = parseInt(currentInput.dataset.col);

    const nextRow = row + 1;

    // Try to find cell directly below
    const belowInput = document.querySelector(`#puzzle input[data-row="${nextRow}"][data-col="${col}"]`);

    if (belowInput) {
        belowInput.focus();
    } else {
        // fallback: move to next input in DOM order (reading order)
        const inputs = [...document.querySelectorAll('#puzzle input')];
        const idx = inputs.indexOf(currentInput);
        if (idx >= 0 && idx + 1 < inputs.length) {
            inputs[idx + 1].focus();
        }
    }
}


// Build solution row based on solutionMap letters
function buildSolutionRow() {
    const solutionContainer = document.getElementById('solution-container');
    solutionContainer.innerHTML = '';

    // Add the label
    const label = document.createElement('div');
    label.innerText = 'Lösungswort:';
    label.style.marginRight = '10px';
    label.style.fontSize = '18px';
    label.style.fontWeight = 'bold';
    solutionContainer.appendChild(label);

    const sortedLetters = Object.keys(crossword.solutionMap).sort();

    sortedLetters.forEach(letter => {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.width = '40px';
        wrapper.style.height = '40px';
        wrapper.style.border = '1px solid #333';
        wrapper.style.background = 'white';
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        wrapper.style.marginRight = '5px';

        const hint = document.createElement('div');
        hint.innerText = letter;
        hint.style.position = 'absolute';
        hint.style.bottom = '2px';
        hint.style.right = '2px';
        hint.style.fontSize = '16px';
        hint.style.color = '#003399';
        hint.style.fontWeight = '900';
        wrapper.appendChild(hint);

        const input = document.createElement('input');
        input.maxLength = 1;
        input.dataset.solutionLetter = letter;
        input.style.position = 'absolute';
        input.style.width = '100%';
        input.style.height = '100%';
        input.style.fontSize = '18px';
        input.style.textAlign = 'center';
        input.style.fontWeight = 'bold';
        input.style.border = 'none';
        input.style.outline = 'none';
        input.style.background = 'transparent';
        wrapper.appendChild(input);

        solutionContainer.appendChild(wrapper);
    });
}


// Correctly update the solution row
function checkSolution() {
    const sortedLetters = Object.keys(crossword.solutionMap).sort();

    sortedLetters.forEach(letter => {
        const [row, col] = crossword.solutionMap[letter];
        const matchingInput = document.querySelector(`#puzzle input[data-row="${row}"][data-col="${col}"]`);
        const value = matchingInput && matchingInput.value ? matchingInput.value.toUpperCase() : '';

        const solutionInput = document.querySelector(`input[data-solution-letter="${letter}"]`);
        if (solutionInput) solutionInput.value = value;
    });
}

buildGrid();
