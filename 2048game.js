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

// 檢查遊戲是否結束
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

// 更新進度條
function updateProgressBar() {
    let highestTile = 0;
    for (let row of grid) {
        for (let cell of row) {
            if (cell > highestTile) {
                highestTile = cell;
            }
        }
    }

    let progress = Math.min((Math.log2(highestTile) - 1) / 10 * 100, 100);
    document.getElementById('progress-fill').style.width = `${progress}%`;

    if (highestTile >= 2048) {
        displayFullScreenMessage(`Pass!`, `恭喜！您達到了 2048！\n最高方塊：${highestTile}`);
        document.removeEventListener('keydown', handleKeydown);
    } else if (checkGameOver()) {
        displayFullScreenMessage(`Game Over`, `遊戲結束！\n最高方塊：${highestTile}`);
        document.removeEventListener('keydown', handleKeydown);
    }
}

// 顯示遊戲結束訊息
function displayFullScreenMessage(title, message) {
    const overlay = document.createElement('div');
    overlay.id = 'fullscreen-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        font-size: 2em;
        text-align: center;
        z-index: 1000;
    `;

    const titleElement = document.createElement('h1');
    titleElement.textContent = title;

    const messageElement = document.createElement('p');
    messageElement.textContent = message;

    const button = document.createElement('button');
    button.textContent = 'play again!';
    button.style.cssText = `
        margin-top: 20px;
        padding: 10px 20px;
        font-size: 1em;
        cursor: pointer;
    `;
    button.addEventListener('click', () => {
        overlay.style.display="none"; // 移除覆蓋層
        titleElement.style.display = "none";
        messageElement.style.display = "none";
        grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
        initGame(); // 開始新一局遊戲
        document.removeEventListener('keydown', handleKeydown); // 移除舊的事件監聽器
        document.addEventListener('keydown', handleKeydown); // 重新添加新的事件監聽器
    });

    overlay.appendChild(titleElement);
    overlay.appendChild(messageElement);
    overlay.appendChild(button);
    document.body.appendChild(overlay);
}

// 更新網格顯示
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

// 處理鍵盤事件
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

// 幫助函數：將數字往一個方向滑動
function slide(rowOrCol) {
    let filtered = rowOrCol.filter(cell => cell !== 0);  // 過濾掉 0
    let merged = [];
    let i = 0;
    while (i < filtered.length) {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
            merged.push(filtered[i] * 2);  // 合併相同的數字
            i += 2; // 合併後跳過下一個元素
        } else {
            merged.push(filtered[i]);
            i++;
        }
    }
    while (merged.length < gridSize) merged.push(0);  // 填充 0 使長度與 gridSize 一致
    return merged;
}

// 向左移動並滑動
function moveLeft() {
    let moved = false;
    for (let row = 0; row < gridSize; row++) {
        let originalRow = [...grid[row]];
        grid[row] = slide(grid[row]);
        if (!arraysEqual(originalRow, grid[row])) moved = true;
    }
    return moved;
}

// 向右移動並滑動
function moveRight() {
    let moved = false;
    for (let row = 0; row < gridSize; row++) {
        let originalRow = [...grid[row]];
        grid[row] = slide(grid[row].reverse()).reverse();
        if (!arraysEqual(originalRow, grid[row])) moved = true;
    }
    return moved;
}

// 向上移動並滑動
function moveUp() {
    let moved = false;
    for (let col = 0; col < gridSize; col++) {
        let originalCol = grid.map(row => row[col]);
        let newCol = slide(originalCol);
        for (let row = 0; row < gridSize; row++) {
            grid[row][col] = newCol[row];
        }
        if (!arraysEqual(originalCol, newCol)) moved = true;
    }
    return moved;
}

// 向下移動並滑動
function moveDown() {
    let moved = false;
    for (let col = 0; col < gridSize; col++) {
        let originalCol = grid.map(row => row[col]);
        let newCol = slide(originalCol.reverse()).reverse();
        for (let row = 0; row < gridSize; row++) {
            grid[row][col] = newCol[row];
        }
        if (!arraysEqual(originalCol, newCol)) moved = true;
    }
    return moved;
}

// 幫助函數：比較兩個數組是否相同
function arraysEqual(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every((val, index) => val === arr2[index]);
}

document.addEventListener('keydown', handleKeydown);
initGame();
