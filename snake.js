// 游戏配置
const config = {
    gridSize: 20,      // 网格大小
    speed: 150,        // 初始速度 (毫秒)
    speedIncrease: 5,  // 每吃一个食物增加的速度
    canvasSize: 400    // 画布大小
};

// 游戏状态
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameInterval;
let isGameOver = false;

// 获取DOM元素
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const gameOverElement = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');

// 初始化游戏
function initGame() {
    // 重置游戏状态
    snake = [
        {x: 5, y: 10},
        {x: 4, y: 10},
        {x: 3, y: 10}
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    isGameOver = false;
    
    // 更新分数显示
    scoreElement.textContent = score;
    
    // 隐藏游戏结束界面
    gameOverElement.style.display = 'none';
    
    // 生成第一个食物
    generateFood();
    
    // 清除之前的游戏循环
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    // 开始游戏循环
    gameInterval = setInterval(gameLoop, config.speed);
}

// 游戏主循环
function gameLoop() {
    // 更新方向
    direction = nextDirection;
    
    // 移动蛇
    moveSnake();
    
    // 检查碰撞
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // 检查是否吃到食物
    if (snake[0].x === food.x && snake[0].y === food.y) {
        eatFood();
    } else {
        // 如果没有吃到食物，移除蛇尾
        snake.pop();
    }
    
    // 绘制游戏
    drawGame();
}

// 移动蛇
function moveSnake() {
    const head = {x: snake[0].x, y: snake[0].y};
    
    // 根据方向移动蛇头
    switch(direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 添加新的蛇头
    snake.unshift(head);
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检查是否撞墙
    if (head.x < 0 || head.x >= config.canvasSize / config.gridSize ||
        head.y < 0 || head.y >= config.canvasSize / config.gridSize) {
        return true;
    }
    
    // 检查是否撞到自己（从第二个身体部分开始检查）
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 生成食物
function generateFood() {
    // 随机生成食物位置
    const gridCount = config.canvasSize / config.gridSize;
    
    // 创建一个临时食物
    let newFood;
    let foodOnSnake;
    
    // 确保食物不会生成在蛇身上
    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * gridCount),
            y: Math.floor(Math.random() * gridCount)
        };
        
        // 检查食物是否在蛇身上
        for (let i = 0; i < snake.length; i++) {
            if (newFood.x === snake[i].x && newFood.y === snake[i].y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = newFood;
}

// 吃食物
function eatFood() {
    // 增加分数
    score += 10;
    scoreElement.textContent = score;
    
    // 生成新食物
    generateFood();
    
    // 增加速度
    if (config.speed > 50) { // 设置最小速度限制
        config.speed -= config.speedIncrease;
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, config.speed);
    }
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    
    // 显示游戏结束界面
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格背景（可选）
    drawGrid();
    
    // 绘制蛇
    drawSnake();
    
    // 绘制食物
    drawFood();
}

// 绘制网格（可选，增加视觉效果）
function drawGrid() {
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.5;
    
    // 绘制垂直线
    for (let x = 0; x <= canvas.width; x += config.gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= canvas.height; y += config.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 绘制蛇
function drawSnake() {
    // 绘制蛇身
    for (let i = 1; i < snake.length; i++) {
        const segment = snake[i];
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(
            segment.x * config.gridSize,
            segment.y * config.gridSize,
            config.gridSize,
            config.gridSize
        );
        
        // 添加内部边框使蛇身看起来有分段效果
        ctx.strokeStyle = '#45a049';
        ctx.strokeRect(
            segment.x * config.gridSize,
            segment.y * config.gridSize,
            config.gridSize,
            config.gridSize
        );
    }
    
    // 绘制蛇头（使用不同颜色）
    const head = snake[0];
    ctx.fillStyle = '#388E3C';
    ctx.fillRect(
        head.x * config.gridSize,
        head.y * config.gridSize,
        config.gridSize,
        config.gridSize
    );
    
    // 添加蛇眼睛（增加视觉效果）
    ctx.fillStyle = '#fff';
    
    // 根据方向绘制眼睛
    const eyeSize = config.gridSize / 5;
    const eyeOffset = config.gridSize / 3;
    
    // 左眼
    let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
    
    switch(direction) {
        case 'up':
            leftEyeX = head.x * config.gridSize + eyeOffset;
            leftEyeY = head.y * config.gridSize + eyeOffset;
            rightEyeX = head.x * config.gridSize + config.gridSize - eyeOffset - eyeSize;
            rightEyeY = head.y * config.gridSize + eyeOffset;
            break;
        case 'down':
            leftEyeX = head.x * config.gridSize + eyeOffset;
            leftEyeY = head.y * config.gridSize + config.gridSize - eyeOffset - eyeSize;
            rightEyeX = head.x * config.gridSize + config.gridSize - eyeOffset - eyeSize;
            rightEyeY = head.y * config.gridSize + config.gridSize - eyeOffset - eyeSize;
            break;
        case 'left':
            leftEyeX = head.x * config.gridSize + eyeOffset;
            leftEyeY = head.y * config.gridSize + eyeOffset;
            rightEyeX = head.x * config.gridSize + eyeOffset;
            rightEyeY = head.y * config.gridSize + config.gridSize - eyeOffset - eyeSize;
            break;
        case 'right':
            leftEyeX = head.x * config.gridSize + config.gridSize - eyeOffset - eyeSize;
            leftEyeY = head.y * config.gridSize + eyeOffset;
            rightEyeX = head.x * config.gridSize + config.gridSize - eyeOffset - eyeSize;
            rightEyeY = head.y * config.gridSize + config.gridSize - eyeOffset - eyeSize;
            break;
    }
    
    ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
    ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);
}

// 绘制食物
function drawFood() {
    ctx.fillStyle = '#FF5722';
    
    // 绘制圆形食物
    ctx.beginPath();
    ctx.arc(
        food.x * config.gridSize + config.gridSize / 2,
        food.y * config.gridSize + config.gridSize / 2,
        config.gridSize / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 添加高光效果
    ctx.fillStyle = '#FFCCBC';
    ctx.beginPath();
    ctx.arc(
        food.x * config.gridSize + config.gridSize / 3,
        food.y * config.gridSize + config.gridSize / 3,
        config.gridSize / 6,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 键盘控制
document.addEventListener('keydown', function(event) {
    // 防止方向键滚动页面
    if([37, 38, 39, 40].indexOf(event.keyCode) > -1) {
        event.preventDefault();
    }
    
    // 只有在游戏进行中才接受输入
    if (!isGameOver) {
        switch(event.keyCode) {
            // 上箭头
            case 38:
            case 87: // W键
                if (direction !== 'down') {
                    nextDirection = 'up';
                }
                break;
            // 下箭头
            case 40:
            case 83: // S键
                if (direction !== 'up') {
                    nextDirection = 'down';
                }
                break;
            // 左箭头
            case 37:
            case 65: // A键
                if (direction !== 'right') {
                    nextDirection = 'left';
                }
                break;
            // 右箭头
            case 39:
            case 68: // D键
                if (direction !== 'left') {
                    nextDirection = 'right';
                }
                break;
        }
    }
});

// 重新开始按钮事件
restartButton.addEventListener('click', initGame);

// 移动端触摸控制（可选）
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
});

document.addEventListener('touchmove', function(event) {
    // 防止页面滚动
    event.preventDefault();
});

document.addEventListener('touchend', function(event) {
    if (isGameOver) return;
    
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // 判断滑动方向
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // 水平滑动
        if (diffX > 0 && direction !== 'left') {
            nextDirection = 'right';
        } else if (diffX < 0 && direction !== 'right') {
            nextDirection = 'left';
        }
    } else {
        // 垂直滑动
        if (diffY > 0 && direction !== 'up') {
            nextDirection = 'down';
        } else if (diffY < 0 && direction !== 'down') {
            nextDirection = 'up';
        }
    }
});

// 游戏初始化
initGame();