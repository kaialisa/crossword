function buildGrid() {
    const puzzleDiv = document.getElementById('puzzle');
    puzzleDiv.className = 'grid';
    puzzleDiv.style.gridTemplateColumns = `repeat(${crossword.width}, 40px)`;

    for (let row = 0; row < crossword.height; row++) {
        for (let col = 0; col < crossword.width; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.position = 'relative';

            if (crossword.blocks.some(([r,c]) => r === row && c === col)) {
                cell.classList.add('black');
            } else {
                const input = document.createElement('input');
                input.maxLength = 1;
                input.addEventListener('input', checkSolution);
                cell.appendChild(input);

                // Add clue number if exists
                const num = crossword.numbers[`${row},${col}`];
                if (num) {
                    const labelParts = [];
                    if (num.across !== undefined) labelParts.push(`${num.across}→`);
                    if (num.down !== undefined) labelParts.push(`${num.down}↓`);
                    const label = labelParts.join('\n');

                    const numberDiv = document.createElement('div');
                    numberDiv.className = 'number';
                    numberDiv.innerText = label;
                    numberDiv.style.position = 'absolute';
                    numberDiv.style.top = '2px';
                    numberDiv.style.left = '2px';
                    numberDiv.style.fontSize = '10px';
                    numberDiv.style.whiteSpace = 'pre';
                    cell.appendChild(numberDiv);
                }

                // Add Lösungswort solution hint
                for (const [letter, pos] of Object.entries(crossword.solutionMap)) {
                    if (pos[0] === row && pos[1] === col) {
                        const solDiv = document.createElement('div');
                        solDiv.innerText = letter;
                        solDiv.style.position = 'absolute';
                        solDiv.style.bottom = '2px';
                        solDiv.style.right = '2px';
                        solDiv.style.fontSize = '14px';
                        solDiv.style.color = 'blue';
                        solDiv.style.opacity = 0.5;
                        cell.appendChild(solDiv);
                    }
                }
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
