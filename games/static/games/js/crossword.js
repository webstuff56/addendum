async function initGame() {
    try {
        const response = await fetch('/static/games/js/puzzle.json');
        const data = await response.json();
        renderGrid(data);
        renderClues(data);
    } catch (e) { console.error(e); }
}

function renderGrid(data) {
    const container = document.getElementById('grid-container');
    if (!container) return;
    container.innerHTML = ''; 
    let currentNumber = 1;
    for (let i = 0; i < 225; i++) {
        const cell = document.createElement('div');
        if (data.blackSquares.includes(i)) {
            cell.className = 'cell black-square';
        } else {
            cell.className = 'cell';
            const r = Math.floor(i / 15), c = i % 15;
            const isAcross = (c === 0 || data.blackSquares.includes(i - 1)) && (c < 14 && !data.blackSquares.includes(i + 1));
            const isDown = (r === 0 || data.blackSquares.includes(i - 15)) && (r < 14 && !data.blackSquares.includes(i + 15));
            if (isAcross || isDown) {
                const num = document.createElement('span');
                num.className = 'cell-number';
                num.textContent = currentNumber++;
                cell.appendChild(num);
            }
            const input = document.createElement('input');
            input.maxLength = 1;
            cell.appendChild(input);
        }
        container.appendChild(cell);
    }
}

function renderClues(data) {
    const sidebar = document.querySelector('.clues-sidebar');
    if (!sidebar) return;
    sidebar.innerHTML = ''; 
    ['across', 'down'].forEach(sec => {
        const h = document.createElement('h3');
        h.textContent = sec.toUpperCase();
        sidebar.appendChild(h);
        const ul = document.createElement('ul');
        ul.style.listStyle = 'none'; // Kills bullets
        ul.style.padding = '0';
        data.clues[sec].forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.number}. ${item.clue}`;
            ul.appendChild(li);
        });
        sidebar.appendChild(ul);
    });
}
initGame();