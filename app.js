let selectedClue = { direction: null, number: null };
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


// Render clue numbers
const num = crossword.numbers[`${row},${col}`];
if (num && !isBlocked) {
    
    // Render down clue in top-left
    if (num.down !== undefined) {
        const downText = document.createElementNS(svgNS, "text");
        downText.setAttribute("x", col * cellSize + 3);
        downText.setAttribute("y", row * cellSize + 10);
        downText.setAttribute("font-size", "12px");
        downText.textContent = `${num.down}↓`;
        svg.appendChild(downText);
    }
    
    // Render across clue in bottom-left
    if (num.across !== undefined) {
        const acrossText = document.createElementNS(svgNS, "text");
        acrossText.setAttribute("x", col * cellSize + 3);
        acrossText.setAttribute("y", (row + 1) * cellSize - 5);  // bottom of cell
        acrossText.setAttribute("font-size", "12px");
        acrossText.textContent = `${num.across}→`; 
        svg.appendChild(acrossText);
    }
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
                // Create wrapper div for proper positioning
               const wrapper = document.createElement('div');
wrapper.classList.add('cell-wrapper');
wrapper.dataset.row = row;
wrapper.dataset.col = col;
wrapper.style.position = 'absolute';
wrapper.style.left = `${col * cellSize}px`;
wrapper.style.top = `${row * cellSize}px`;
wrapper.style.width = `${cellSize}px`;
wrapper.style.height = `${cellSize}px`;
wrapper.style.background = 'white';


                // Create input inside wrapper
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.dataset.row = row;
                input.dataset.col = col;

                input.style.width = '100%';
                input.style.height = '100%';
                input.style.textAlign = 'center';
                input.style.fontSize = '18px';
                input.style.fontWeight = 'bold';
                input.style.border = 'none';
                input.style.outline = 'none';
                input.style.background = 'transparent';

                // Attach event listeners BEFORE appending
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace') {
                        if (e.target.selectionStart === 0) {
                            const moved = moveToPreviousInput(e.target);
                            if (moved) {
                                moved.value = '';
                                e.preventDefault();
                            }
                        }
                    }
                });

                input.addEventListener('click', (e) => {
                    const row = parseInt(e.target.dataset.row);
                    const col = parseInt(e.target.dataset.col);
                    const clue = getClueAtCell(row, col);
                    if (clue) {
                        selectedClue = clue;
                        highlightClueCells();
                    }
                });

                input.addEventListener('input', (e) => {
                    const val = e.target.value.toUpperCase();
                    e.target.value = val;

                    if (val.length === 1) {
                        moveToNextInput(e.target);
                    }
                    checkSolution();
                });

                // Append input into wrapper
                wrapper.appendChild(input);
                inputLayer.appendChild(wrapper);
            }
        }
    }

    container.appendChild(inputLayer);
}


// Auto-advance logic
function moveToNextInput(currentInput) {
    const row = parseInt(currentInput.dataset.row);
    const col = parseInt(currentInput.dataset.col);

    // 1. Try next column (right)
    if (col + 1 < crossword.width) {
        const rightInput = document.querySelector(`#puzzle input[data-row="${row}"][data-col="${col + 1}"]`);
        if (rightInput) {
            rightInput.focus();
            return;
        }
    }

    // 2. If no right cell found, try next row (down)
    if (row + 1 < crossword.height) {
        const downInput = document.querySelector(`#puzzle input[data-row="${row + 1}"][data-col="${col}"]`);
        if (downInput) {
            downInput.focus();
            return;
        }
    }

    // 3. Fallback: search reading order (DOM order)
    const inputs = [...document.querySelectorAll('#puzzle input')];
    let idx = inputs.indexOf(currentInput);
    while (++idx < inputs.length) {
        if (!inputs[idx].value) {
            inputs[idx].focus();
            return;
        }
    }
}


function moveToPreviousInput(currentInput) {
    const row = parseInt(currentInput.dataset.row);
    const col = parseInt(currentInput.dataset.col);

    // 1. Try previous column (left)
     if (col - 1 >= 0) {
        const leftInput = document.querySelector(`#puzzle input[data-row="${row}"][data-col="${col - 1}"]`);
        if (leftInput) {
            leftInput.focus();
            return;
        }
    }

    // 2. Try previous row (up)
   if (row - 1 >= 0) {
        const upInput = document.querySelector(`#puzzle input[data-row="${row - 1}"][data-col="${col}"]`);
        if (upInput) {
            upInput.focus();
            return;
        }
    }

    // 3. Fallback reverse DOM order
    const inputs = [...document.querySelectorAll('#puzzle input')];
    let idx = inputs.indexOf(currentInput);
    while (--idx >= 0) {
        if (inputs[idx]) {
            inputs[idx].focus();
            return inputs[idx];
        }
    }

    return null;
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


// Update the solution row
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

function getClueAtCell(row, col) {
    for (let num in crossword.clues.across) {
        const clue = crossword.clues.across[num];
        if (clue.cells.some(([r, c]) => r === row && c === col)) {
            return { direction: 'across', number: num };
        }
    }
    for (let num in crossword.clues.down) {
        const clue = crossword.clues.down[num];
        if (clue.cells.some(([r, c]) => r === row && c === col)) {
            return { direction: 'down', number: num };
        }
    }
    return null;
}

function highlightClueCells() {
    document.querySelectorAll('#puzzle .cell-wrapper').forEach(wrapper => wrapper.classList.remove('highlighted'));

    if (!selectedClue.direction || !selectedClue.number) return;

    const clue = crossword.clues[selectedClue.direction][selectedClue.number];
    clue.cells.forEach(([r, c]) => {
        const wrapper = document.querySelector(`#puzzle .cell-wrapper[data-row="${r}"][data-col="${c}"]`);
        if (wrapper) wrapper.classList.add('highlighted');
    });
}




buildGrid();
