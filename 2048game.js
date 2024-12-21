const gridSize = 4;
let grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
let score = 0;

// 初始化遊戲
function initGame() {
    addRandomTile();
    addRandomTile();
    updateGrid();
    updateProgressBar();
}

// 隨機添加一個數字到空格位置
function addRandomTile() {
    let emptyCells = [];
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col] === 0) emptyCells.push({ row, col });
        }
    }
    if (emptyCells.length > 0) {
        let { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
}

function checkGameOver() {
    for (let row of grid) {
        for (let cell of row) {
            if (cell === 0) return false;
        }
    }
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            let current = grid[i][j];
            if (
                (i > 0 && grid[i - 1][j] === current) || 
                (i < grid.length - 1 && grid[i + 1][j] === current) || 
                (j > 0 && grid[i][j - 1] === current) || 
                (j < grid[i].length - 1 && grid[i][j + 1] === current)
            ) {
                return false;
            }
        }
    }
    return true;
}

function updateProgressBar() {
    let highestTile = 0;
    for (let row of grid) {
        for (let cell of row) {
            if (cell > highestTile) {
                highestTile = cell;
            }
        }
    }
    let level = Math.floor(Math.log2(highestTile)) - 1;
    let progress = Math.min((level / 10) * 100, 100);
    document.getElementById('progress-fill').style.width = `${progress}%`;

    if (highestTile >= 2048 || checkGameOver()) {
        let message = highestTile >= 2048
            ? `恭喜你達到2048！完成 100%！`
            : `遊戲結束！你完成了 ${progress.toFixed(1)}%！`;
        displayGameOverMessage(message);
        addRestartButton();
        document.removeEventListener('keydown', handleKeydown);
    }
}

function displayGameOverMessage(message) {
    const messageContainer = document.getElementById('message-container');
    if (!messageContainer) {
        const container = document.createElement('div');
        container.id = 'message-container';
        container.style.cssText = `
            text-align: center;
            margin-top: 20px;
        `;
        const messageElement = document.createElement('p');
        messageElement.id = 'game-over-message';
        messageElement.textContent = message;
        container.appendChild(messageElement);
        document.getElementById('game-container').appendChild(container);
    } else {
        const messageElement = document.getElementById('game-over-message');
        messageElement.textContent = message;
    }
}

function addRestartButton() {
    const messageContainer = document.getElementById('message-container');
    const existingButton = document.getElementById('restart-button');
    if (!existingButton) {
        const button = document.createElement('button');
        button.id = 'restart-button';
        button.textContent = '重新開始';
        button.style.cssText = `
            margin-top: 10px;
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
        `;
        button.addEventListener('click', () => {
            button.remove();
            const message = document.getElementById('game-over-message');
            if (message) message.remove();
            grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
            initGame();
            document.addEventListener('keydown', handleKeydown);
        });
        messageContainer.appendChild(button);
    }
}

function updateGrid() {
    const gridElement = document.getElementById('game-grid');
    gridElement.innerHTML = '';
    for (let row of grid) {
        for (let cell of row) {
            const cellElement = document.createElement('div');
            cellElement.className = 'tile';
            cellElement.textContent = cell === 0 ? '' : cell;
            cellElement.setAttribute('data-value', cell);
            gridElement.appendChild(cellElement);
        }
    }
    updateProgressBar();
}

function handleKeydown(event) {
    let moved = false;
    switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            moved = moveLeft();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            moved = moveRight();
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
            moved = moveUp();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            moved = moveDown();
            break;
    }
    if (moved) {
        addRandomTile();
        updateGrid();
        updateProgressBar();
    }
}

function slide(row) {
    row = row.filter(val => val);
    for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i + 1]) {
            row[i] *= 2;
            row[i + 1] = 0;
        }
    }
    row = row.filter(val => val);
    return row.concat(Array(gridSize - row.length).fill(0));
}

function moveLeft() {
    let moved = false;
    for (let row = 0; row < gridSize; row++) {
        let originalRow = [...grid[row]];
        let newRow = slide(grid[row]);
        grid[row] = newRow;
        if (newRow.toString() !== originalRow.toString()) moved = true;
    }
    return moved;
}

function moveRight() {
    let moved = false;
    for (let row = 0; row < gridSize; row++) {
        let originalRow = [...grid[row]];
        let newRow = slide(grid[row].reverse()).reverse();
        grid[row] = newRow;
        if (newRow.toString() !== originalRow.toString()) moved = true;
    }
    return moved;
}

function moveUp() {
    let moved = false;
    for (let col = 0; col < gridSize; col++) {
        let column = grid.map(row => row[col]);
        let originalColumn = [...column];
        let newColumn = slide(column);
        for (let row = 0; row < gridSize; row++) {
            grid[row][col] = newColumn[row];
        }
        if (newColumn.toString() !== originalColumn.toString()) moved = true;
    }
    return moved;
}

function moveDown() {
    let moved = false;
    for (let col = 0; col < gridSize; col++) {
        let column = grid.map(row => row[col]);
        let originalColumn = [...column];
        let newColumn = slide(column.reverse()).reverse();
        for (let row = 0; row < gridSize; row++) {
            grid[row][col] = newColumn[row];
        }
        if (newColumn.toString() !== originalColumn.toString()) moved = true;
    }
    return moved;
}

document.addEventListener('keydown', handleKeydown);
initGame();
