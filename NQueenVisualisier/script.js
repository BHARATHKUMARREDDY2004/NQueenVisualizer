const canvas = document.getElementById('nqueenCanvas');
const ctx = canvas.getContext('2d');
const WIDTH = 600;
let ROW = 8;  // Default value
let CELL_SIZE = WIDTH / ROW;

const colors = {
    RED: 'rgba(255, 0, 0, 0.7)',
    GREEN: 'rgba(0, 255, 0, 0.7)',
    BLUE: 'rgba(0, 0, 255, 0.7)',
    YELLOW: 'rgba(255, 255, 0, 0.7)',
    WHITE: 'rgba(255, 255, 255, 0.7)',
    BLACK: 'rgba(0, 0, 0, 0.7)',
    PURPLE: 'rgba(128, 0, 128, 0.7)',
    ORANGE: 'rgba(255, 165, 0, 0.7)',
    GREY: 'rgba(128, 128, 128, 0.7)',
    TURQUOISE: 'rgba(64, 224, 208, 0.7)',
};

class Spot {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.x = row * CELL_SIZE;
        this.y = col * CELL_SIZE;
        this.color = colors.WHITE;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = colors.GREY;
        ctx.strokeRect(this.x, this.y, CELL_SIZE, CELL_SIZE);
    }

    isClosed() {
        return this.color === colors.RED;
    }

    isOpen() {
        return this.color === colors.GREEN;
    }

    isBarrier() {
        return this.color === colors.BLACK;
    }

    isChecking() {
        return this.color === colors.BLUE;
    }

    isReset() {
        return this.color === colors.WHITE;
    }

    makeClosed() {
        this.color = colors.RED;
    }

    makeOpen() {
        this.color = colors.GREEN;
    }

    makeBarrier() {
        this.color = colors.BLACK;
    }

    makeChecking() {
        this.color = colors.BLUE;
    }

    makeReset() {
        this.color = colors.WHITE;
    }
}

function makeGrid(rows) {
    const grid = [];
    for (let i = 0; i < rows; i++) {
        grid[i] = [];
        for (let j = 0; j < rows; j++) {
            grid[i][j] = new Spot(i, j);
        }
    }
    return grid;
}

function drawGrid(grid) {
    for (let row of grid) {
        for (let spot of row) {
            spot.draw();
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function isSafe(grid, row, col) {
    let temp = grid[row][col].color;
    grid[row][col].makeOpen();
    drawGrid(grid);
    await sleep(200);

    for (let i = 0; i < col; i++) {
        if (grid[row][i].isBarrier()) {
            grid[row][i].makeClosed();
            drawGrid(grid);
            await sleep(200);
            grid[row][i].makeBarrier();
            drawGrid(grid);
            await sleep(200);
            grid[row][col].makeReset();
            return false;
        }
        if (!grid[row][i].isOpen()) {
            grid[row][i].makeChecking();
            drawGrid(grid);
            await sleep(200);
        }
    }

    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
        if (grid[i][j].isBarrier()) {
            grid[i][j].makeClosed();
            drawGrid(grid);
            await sleep(200);
            grid[i][j].makeBarrier();
            drawGrid(grid);
            await sleep(200);
            grid[row][col].makeReset();
            return false;
        }
        if (!grid[i][j].isOpen()) {
            grid[i][j].makeChecking();
            drawGrid(grid);
            await sleep(200);
        }
    }

    for (let i = row, j = col; i < ROW && j >= 0; i++, j--) {
        if (grid[i][j].isBarrier()) {
            grid[i][j].makeClosed();
            drawGrid(grid);
            await sleep(200);
            grid[i][j].makeBarrier();
            drawGrid(grid);
            await sleep(200);
            grid[row][col].makeReset();
            return false;
        }
        if (!grid[i][j].isOpen()) {
            grid[i][j].makeChecking();
            drawGrid(grid);
            await sleep(200);
        }
    }

    grid[row][col].color = temp;
    return true;
}

async function solveNQUtil(grid, col) {
    if (col >= ROW) {
        return true;
    }

    for (let i = 0; i < ROW; i++) {
        if (await isSafe(grid, i, col)) {
            grid[i][col].makeBarrier();
            drawGrid(grid);
            await sleep(200);
            if (await solveNQUtil(grid, col + 1)) {
                return true;
            }
            grid[i][col].makeReset();
            drawGrid(grid);
            await sleep(200);
        }
    }

    return false;
}

async function algorithm(grid) {
    const solution = await solveNQUtil(grid, 0);
    if (!solution) {
        console.log('No Solution');
    } else {
        console.log('Solution Found');
    }
}

function resetGrid(grid) {
    for (let row of grid) {
        for (let spot of row) {
            spot.makeReset();
        }
    }
    drawGrid(grid);
}

document.getElementById('startButton').addEventListener('click', async () => {
    const queenCountInput = document.getElementById('queenCount').value;
    const queenCount = parseInt(queenCountInput);

    if (isNaN(queenCount) || queenCount < 4 || queenCount > 20) {
        alert('Please enter a valid number of queens between 4 and 20.');
        return;
    }

    ROW = queenCount;
    CELL_SIZE = WIDTH / ROW;

    const grid = makeGrid(ROW);
    drawGrid(grid);

    await algorithm(grid);
});

document.getElementById('resetButton').addEventListener('click', () => {
    const grid = makeGrid(ROW);
    resetGrid(grid);
});
