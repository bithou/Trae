// 游戏配置
const config = {
    gridSize: 20,      // 网格大小
    speed: 150,        // 初始速度 (毫秒)
    speedIncrease: 5,  // 每吃一个食物增加的速度
    canvasSize: 400,   // 画布大小
    obstacleCount: 5,  // 障碍物数量
    specialFoodChance: 0.3 // 特殊食物出现概率 (0-1)
};

// 游戏状态
let snake = [];
let food = {};
let specialFood = null; // 特殊食物
let obstacles = []; // 障碍物
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameInterval;
let isGameOver = false;
let isPaused = false; // 游戏暂停状态
let level = 1; // 当前关卡
let foodEaten = 0; // 已吃食物数量

// 获取DOM元素
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const gameOverElement = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');
const levelElement = document.getElementById('level');
const pauseButton = document.getElementById('pause-button');

// 音效
const eatSound = new Audio();
eatSound.src = 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3';
const specialEatSound = new Audio();
specialEatSound.src = 'https://assets.mixkit.co/sfx/preview/mixkit-bonus-earned-in-video-game-2058.mp3';
const gameOverSound = new Audio();
gameOverSound.src = 'https://assets.mixkit.co/sfx/preview/mixkit-player-losing-or-failing-2042.mp3';

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
    isPaused = false;
    level = 1;
    foodEaten = 0;
    specialFood = null;
    obstacles = [];
    
    // 更新分数和关卡显示
    scoreElement.textContent = score;
    levelElement.textContent = level;
    
    // 隐藏游戏结束界面
    gameOverElement.style.display = 'none';
    
    // 生成障碍物
    generateObstacles();
    
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
    // 如果游戏暂停，不执行任何操作
    if (isPaused) return;
    
    // 更新方向
    direction = nextDirection;
    
    // 移动蛇
    moveSnake();
    
    // 检查碰撞
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // 检查是否吃到普通食物
    if (snake[0].x === food.x && snake[0].y === food.y) {
        eatFood();
    } 
    // 检查是否吃到特殊食物
    else if (specialFood && snake[0].x === specialFood.x && snake[0].y === specialFood.y) {
        eatSpecialFood();
    } else {
        // 如果没有吃到食物，移除蛇尾
        snake.pop();
    }
    
    // 随机生成特殊食物
    if (!specialFood && Math.random() < 0.01) { // 每帧有1%的概率生成特殊食物
        generateSpecialFood();
    }
    
    // 如果特殊食物存在，检查是否应该消失
    if (specialFood && specialFood.timeLeft > 0) {
        specialFood.timeLeft--;
        if (specialFood.timeLeft <= 0) {
            specialFood = null;
        }
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
    
    // 检查是否撞到障碍物
    for (let i = 0; i < obstacles.length; i++) {
        if (head.x === obstacles[i].x && head.y === obstacles[i].y) {
            return true;
        }
    }
    
    return false;
}

// 生成障碍物
function generateObstacles() {
    obstacles = [];
    const gridCount = config.canvasSize / config.gridSize;
    
    // 根据当前关卡增加障碍物数量
    const obstacleCount = config.obstacleCount + Math.floor(level / 2);
    
    for (let i = 0; i < obstacleCount; i++) {
        let newObstacle;
        let obstacleOnSnake;
        let obstacleOnFood;
        let obstacleOnObstacle;
        
        do {
            obstacleOnSnake = false;
            obstacleOnFood = false;
            obstacleOnObstacle = false;
            
            newObstacle = {
                x: Math.floor(Math.random() * gridCount),
                y: Math.floor(Math.random() * gridCount)
            };
            
            // 检查障碍物是否在蛇身上
            for (let j = 0; j < snake.length; j++) {
                if (newObstacle.x === snake[j].x && newObstacle.y === snake[j].y) {
                    obstacleOnSnake = true;
                    break;
                }
            }
            
            // 检查障碍物是否在食物上
            if (food && newObstacle.x === food.x && newObstacle.y === food.y) {
                obstacleOnFood = true;
            }
            
            // 检查障碍物是否在其他障碍物上
            for (let j = 0; j < obstacles.length; j++) {
                if (newObstacle.x === obstacles[j].x && newObstacle.y === obstacles[j].y) {
                    obstacleOnObstacle = true;
                    break;
                }
            }
            
        } while (obstacleOnSnake || obstacleOnFood || obstacleOnObstacle);
        
        obstacles.push(newObstacle);
    }
}

// 生成食物
function generateFood() {
    // 随机生成食物位置
    const gridCount = config.canvasSize / config.gridSize;
    
    // 创建一个临时食物
    let newFood;
    let foodOnSnake;
    let foodOnObstacle;
    
    // 确保食物不会生成在蛇身上或障碍物上
    do {
        foodOnSnake = false;
        foodOnObstacle = false;
        foodOnNormalFood = false;
        
        newFood = {
            x: Math.floor(Math.random() * gridCount),
            y: Math.floor(Math.random() * gridCount),
            type: 'special',
            timeLeft: 100 // 特殊食物存在的时间（帧数）
        };
        
        // 检查特殊食物是否在蛇身上
        for (let i = 0; i < snake.length; i++) {
            if (newFood.x === snake[i].x && newFood.y === snake[i].y) {
                foodOnSnake = true;
                break;
            }
        }
        
        // 检查特殊食物是否在障碍物上
        for (let i = 0; i < obstacles.length; i++) {
            if (newFood.x === obstacles[i].x && newFood.y === obstacles[i].y) {
                foodOnObstacle = true;
                break;
            }
        }
        
        // 检查特殊食物是否在普通食物上
        if (food && newFood.x === food.x && newFood.y === food.y) {
            foodOnNormalFood = true;
        }
        
    } while (foodOnSnake || foodOnObstacle || foodOnNormalFood);
    
    specialFood = newFood;
}

// 吃食物
        
        newFood = {
            x: Math.floor(Math.random() * gridCount),
            y: Math.floor(Math.random() * gridCount),
            type: Math.random() < config.specialFoodChance ? 'special' : 'normal'
        };
        
        // 检查食物是否在蛇身上
        for (let i = 0; i < snake.length; i++) {
            if (newFood.x === snake[i].x && newFood.y === snake[i].y) {
                foodOnSnake = true;
                break;
            }
        }
        
        // 检查食物是否在障碍物上
        for (let i = 0; i < obstacles.length; i++) {
            if (newFood.x === obstacles[i].x && newFood.y === obstacles[i].y) {
                foodOnObstacle = true;
                break;
            }
        }
        
    } while (foodOnSnake || foodOnObstacle);
    
    food = newFood;
}

// 生成特殊食物
function generateSpecialFood() {
    const gridCount = config.canvasSize / config.gridSize;
    
    let newFood;
    let foodOnSnake;
    let foodOnObstacle;
    let foodOnNormalFood;
    
    do {
        foodOnSnake = false;
        foodOnObstacle = false;
        foodOnNormalFood = false;
        
        newFood = {
            x: Math.floor(Math.random() * gridCount),
            y: Math.floor(Math.random() * gridCount),
            type: 'special',
            timeLeft: 100 // 特殊食物存在的时间（帧数）
        };
        
        // 检查特殊食物是否在蛇身上
        for (let i = 0; i < snake.length; i++) {
            if (newFood.x === snake[i].x && newFood.y === snake[i].y) {
                foodOnSnake = true;
                break;
            }
        }
        
        // 检查特殊食物是否在障碍物上
        for (let i = 0; i < obstacles.length; i++) {
            if (newFood.x === obstacles[i].x && newFood.y === obstacles[i].y) {
                foodOnObstacle = true;
                break;
            }
        }
        
        // 检查特殊食物是否在普通食物上
        if (food && newFood.x === food.x && newFood.y === food.y) {
            foodOnNormalFood = true;
        }
        
    } while (foodOnSnake || foodOnObstacle || foodOnNormalFood);
    
    specialFood = newFood;
}

// 吃食物

// 吃食物
function eatFood() {
    // 播放音效
    eatSound.play();
    
    // 增加分数
    score += 10;
    scoreElement.textContent = score;
    
    // 增加已吃食物计数
    foodEaten++;
    
    // 每吃5个食物升一级
    if (foodEaten % 5 === 0) {
        level++;
        levelElement.textContent = level;
        
        // 生成新的障碍物
        generateObstacles();
    }
    
    // 生成新食物
    generateFood();
    
    // 增加速度
    if (config.speed > 50) { // 设置最小速度限制
        config.speed -= config.speedIncrease;
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, config.speed);
    }
}

// 吃特殊食物
function eatSpecialFood() {
    // 播放特殊音效
    specialEatSound.play();
    
    // 特殊食物给更多分数
    score += 30;
    scoreElement.textContent = score;
    
    // 清除特殊食物
    specialFood = null;
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    
    // 播放游戏结束音效
    gameOverSound.play();
    
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
    
    // 绘制障碍物
    drawObstacles();
    
    // 绘制蛇
    drawSnake();
    
    // 绘制食物
    drawFood();
    
    // 绘制特殊食物（如果存在）
    if (specialFood) {
        drawSpecialFood();
    }
}

// 绘制网格和背景
function drawGrid() {
    // 创建渐变背景
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#e0f7fa');
    gradient.addColorStop(1, '#b2ebf2');
    
    // 填充背景
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制装饰性图案
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    // 绘制网格
    for (let x = 0; x <= canvas.width; x += config.gridSize * 2) {
        for (let y = 0; y <= canvas.height; y += config.gridSize * 2) {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

// 绘制蛇
function drawSnake() {
    // 绘制蛇身
    for (let i = 1; i < snake.length; i++) {
        const segment = snake[i];
        const x = segment.x * config.gridSize;
        const y = segment.y * config.gridSize;
        
        // 创建渐变色蛇身
        const gradient = ctx.createRadialGradient(
            x + config.gridSize/2, y + config.gridSize/2, 2,
            x + config.gridSize/2, y + config.gridSize/2, config.gridSize/1.5
        );
        gradient.addColorStop(0, '#66bb6a');
        gradient.addColorStop(1, '#43a047');
        
        // 绘制圆形蛇身段
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x + config.gridSize/2, y + config.gridSize/2, 
                config.gridSize/2 - 1, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加鳞片效果
        ctx.strokeStyle = '#81c784';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + config.gridSize/2, y + config.gridSize/2, 
                config.gridSize/3, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // 绘制蛇头
    const head = snake[0];
    const headX = head.x * config.gridSize;
    const headY = head.y * config.gridSize;
    
    // 创建渐变色蛇头
    const headGradient = ctx.createRadialGradient(
        headX + config.gridSize/2, headY + config.gridSize/2, 2,
        headX + config.gridSize/2, headY + config.gridSize/2, config.gridSize/1.5
    );
    headGradient.addColorStop(0, '#4caf50');
    headGradient.addColorStop(1, '#2e7d32');
    
    // 绘制椭圆形蛇头
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.ellipse(headX + config.gridSize/2, headY + config.gridSize/2,
            config.gridSize/1.8, config.gridSize/2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 添加蛇眼睛
    ctx.fillStyle = '#fff';
    
    // 根据方向确定眼睛位置
    let eyeX1, eyeX2, eyeY1, eyeY2;
    const eyeSize = config.gridSize / 6;
    const eyeDistance = config.gridSize / 3;
    
    switch(direction) {
        case 'right':
            eyeX1 = eyeX2 = headX + config.gridSize * 0.7;
            eyeY1 = headY + config.gridSize * 0.3;
            eyeY2 = headY + config.gridSize * 0.7;
            break;
        case 'left':
            eyeX1 = eyeX2 = headX + config.gridSize * 0.3;
            eyeY1 = headY + config.gridSize * 0.3;
            eyeY2 = headY + config.gridSize * 0.7;
            break;
        case 'up':
            eyeY1 = eyeY2 = headY + config.gridSize * 0.3;
            eyeX1 = headX + config.gridSize * 0.3;
            eyeX2 = headX + config.gridSize * 0.7;
            break;
        case 'down':
            eyeY1 = eyeY2 = headY + config.gridSize * 0.7;
            eyeX1 = headX + config.gridSize * 0.3;
            eyeX2 = headX + config.gridSize * 0.7;
            break;
    }
    
    // 绘制眼睛
    ctx.beginPath();
    ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
    ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // 添加眼珠
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(eyeX1, eyeY1, eyeSize/2, 0, Math.PI * 2);
    ctx.arc(eyeX2, eyeY2, eyeSize/2, 0, Math.PI * 2);
    ctx.fill();
    
    // 添加蛇舌头
    ctx.fillStyle = '#ff5252';
    ctx.beginPath();
    
    let tongueStartX, tongueStartY, tongueEndX, tongueEndY;
    const tongueLength = config.gridSize * 0.8;
    const tongueWidth = config.gridSize / 8;
    
    switch(direction) {
        case 'right':
            tongueStartX = headX + config.gridSize;
            tongueStartY = headY + config.gridSize/2;
            tongueEndX = tongueStartX + tongueLength;
            tongueEndY = tongueStartY;
            break;
        case 'left':
            tongueStartX = headX;
            tongueStartY = headY + config.gridSize/2;
            tongueEndX = tongueStartX - tongueLength;
            tongueEndY = tongueStartY;
            break;
        case 'up':
            tongueStartX = headX + config.gridSize/2;
            tongueStartY = headY;
            tongueEndX = tongueStartX;
            tongueEndY = tongueStartY - tongueLength;
            break;
        case 'down':
            tongueStartX = headX + config.gridSize/2;
            tongueStartY = headY + config.gridSize;
            tongueEndX = tongueStartX;
            tongueEndY = tongueStartY + tongueLength;
            break;
    }
    
    // 绘制舌头主体
    ctx.moveTo(tongueStartX, tongueStartY);
    ctx.lineTo(tongueEndX, tongueEndY);
    ctx.lineWidth = tongueWidth;
    ctx.strokeStyle = '#ff5252';
    ctx.stroke();
    
    // 绘制舌头分叉
    const forkSize = tongueLength / 3;
    if (direction === 'right' || direction === 'left') {
        ctx.beginPath();
        ctx.moveTo(tongueEndX, tongueEndY);
        ctx.lineTo(tongueEndX + (direction === 'right' ? forkSize : -forkSize), tongueEndY - forkSize/2);
        ctx.moveTo(tongueEndX, tongueEndY);
        ctx.lineTo(tongueEndX + (direction === 'right' ? forkSize : -forkSize), tongueEndY + forkSize/2);
        ctx.lineWidth = tongueWidth * 0.8;
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.moveTo(tongueEndX, tongueEndY);
        ctx.lineTo(tongueEndX - forkSize/2, tongueEndY + (direction === 'down' ? forkSize : -forkSize));
        ctx.moveTo(tongueEndX, tongueEndY);
        ctx.lineTo(tongueEndX + forkSize/2, tongueEndY + (direction === 'down' ? forkSize : -forkSize));
        ctx.lineWidth = tongueWidth * 0.8;
        ctx.stroke();
    }
    
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

// 绘制障碍物
function drawObstacles() {
    ctx.fillStyle = '#607D8B';
    
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        ctx.fillRect(
            obstacle.x * config.gridSize,
            obstacle.y * config.gridSize,
            config.gridSize,
            config.gridSize
        );
        
        // 添加纹理效果
        ctx.strokeStyle = '#455A64';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            obstacle.x * config.gridSize,
            obstacle.y * config.gridSize,
            config.gridSize,
            config.gridSize
        );
    }
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

// 绘制特殊食物
function drawSpecialFood() {
    // 使用闪烁效果
    const alpha = 0.5 + 0.5 * Math.sin(Date.now() / 100);
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`; // 金色
    
    // 绘制星形特殊食物
    const centerX = specialFood.x * config.gridSize + config.gridSize / 2;
    const centerY = specialFood.y * config.gridSize + config.gridSize / 2;
    const spikes = 5;
    const outerRadius = config.gridSize / 2;
    const innerRadius = config.gridSize / 4;
    
    ctx.beginPath();
    let rot = Math.PI / 2 * 3;
    let x = centerX;
    let y = centerY;
    let step = Math.PI / spikes;
    
    ctx.moveTo(centerX, centerY - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = centerX + Math.cos(rot) * outerRadius;
        y = centerY + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        
        x = centerX + Math.cos(rot) * innerRadius;
        y = centerY + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(centerX, centerY - outerRadius);
    ctx.closePath();
    ctx.fill();
}

// 键盘控制
document.addEventListener('keydown', function(event) {
    // 防止方向键滚动页面
    if([37, 38, 39, 40].indexOf(event.keyCode) > -1) {
        event.preventDefault();
    }
    
    // 暂停/继续游戏 (空格键或P键)
    if ((event.keyCode === 32 || event.keyCode === 80) && !isGameOver) {
        isPaused = !isPaused;
        if (pauseButton) {
            pauseButton.textContent = isPaused ? '继续' : '暂停';
        }
        return;
    }
    
    // 只有在游戏进行中且未暂停时才接受方向输入
    if (!isGameOver && !isPaused) {
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

// 暂停按钮事件
pauseButton.addEventListener('click', function() {
    if (!isGameOver) {
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? '继续' : '暂停';
    }
});

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
    if (isGameOver || isPaused) return;
    
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