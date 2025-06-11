function buildGrid() {
    const puzzleDiv = document.getElementById('puzzle');
    puzzleDiv.className = 'grid';
    puzzleDiv.style.gridTemplateColumns = `repeat(${crossword.width}, 40px)`;

    for (let row = 0; row < crossword.height; row++) {
        for (let col = 0; col < crossword.width; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            if (crossword.blocks.some(([r,c]) => r === row && c === col)) {
                cell.classList.add('black');
            } else {
                const input = document.createElement('input');
                input.maxLength = 1;
                input.addEventListener('input', checkSolution);
                cell.appendChild(input);
            }

            puzzleDiv.appendChild(cell);
        }
    }
}

function checkSolution() {
    let solution = '';

    for (const letter in crossword.solutionMap) {
        const [row, col] = crossword.solutionMap[letter];
        const index = row * crossword.width + col;
        const cell = document.getElementById('puzzle').children[index];
        const input = cell.querySelector('input');
        solution += input ? input.value.toUpperCase() : '_';
    }

    document.getElementById('solution').innerText = 'Lösungswort: ' + solution;
}

buildGrid();
