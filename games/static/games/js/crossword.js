/* C:\addendum\games\static\games\js\crossword.js 
   DATE: January 30, 2026
   TIME: 5:30 PM
   SYNC: Fixed clue injection to preserve faceted HTML headers. 
         Added dynamic grid column scaling based on JSON data.
*/

async function initGame() {
    try {
        const response = await fetch('/static/games/js/puzzle.json');
        const data = await response.json();
        renderGrid(data);
        renderClues(data);
    } catch (e) { 
        console.error("Layout Error: Could not load puzzle.json", e); 
    }
}

function renderGrid(data) {
    const container = document.getElementById('grid-container');
    if (!container) return;
    
    // Dynamic Grid Setup: Adjust columns based on the puzzle size in JSON
    const size = data.size || 15; // Default to 15 if not specified
    container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    container.innerHTML = ''; 

    let currentNumber = 1;
    const totalCells = size * size;

    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        
        if (data.blackSquares.includes(i)) {
            cell.className = 'cell black-square';
        } else {
            cell.className = 'cell';
            const r = Math.floor(i / size);
            const c = i % size;

            // Logic to determine if a cell needs a number
            const isAcrossStart = (c === 0 || data.blackSquares.includes(i - 1)) && 
                                  (c < size - 1 && !data.blackSquares.includes(i + 1));
            const isDownStart = (r === 0 || data.blackSquares.includes(i - size)) && 
                                (r < size - 1 && !data.blackSquares.includes(i + size));

            if (isAcrossStart || isDownStart) {
                const num = document.createElement('span');
                num.className = 'cell-number';
                num.textContent = currentNumber;
                cell.appendChild(num);
                currentNumber++;
            }

            const input = document.createElement('input');
            input.maxLength = 1;
            cell.appendChild(input);
        }
        container.appendChild(cell);
    }
}

function renderClues(data) {
    // Target the specific UL containers we built in the HTML
    const acrossList = document.getElementById('across-clues');
    const downList = document.getElementById('down-clues');

    if (acrossList) {
        acrossList.innerHTML = ''; // Clear only the list, not the H3 header
        data.clues.across.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${item.number}.</strong> ${item.clue}`;
            acrossList.appendChild(li);
        });
    }

    if (downList) {
        downList.innerHTML = '';
        data.clues.down.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${item.number}.</strong> ${item.clue}`;
            downList.appendChild(li);
        });
    }
}

initGame();