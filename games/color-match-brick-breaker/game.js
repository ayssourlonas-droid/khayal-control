class ColorMatchBrickBreaker {
            constructor() {
                this.canvas = document.getElementById('gameCanvas');
                this.ctx = this.canvas.getContext('2d');
                this.scoreElement = document.getElementById('score');
                this.finalScoreElement = document.getElementById('finalScore');
                this.gameOverElement = document.getElementById('gameOver');
                this.gameOverTitle = document.getElementById('gameOverTitle');
                this.activePowerUpsElement = document.getElementById('activePowerUps');
                
                // Game constants
                this.windowWidth = 800;
                this.windowHeight = 500;
                this.brickRows = 5;
                this.brickCols = 10;
                this.brickWidth = 70;
                this.brickHeight = 20;
                this.paddleWidth = 100;
                this.paddleHeight = 15;
                this.maxBalls = 8;
                this.ballRadius = 8;
                
                // Colors
                this.colors = [
                    { r: 231/255, g: 76/255, b: 60/255 },   // Red
                    { r: 39/255, g: 174/255, b: 96/255 }    // Green
                ];
                
                // Power-up types
                this.POWERUP_TYPES = {
                    SPEED: 0,
                    MULTIBALL: 1,
                    WIDER_PADDLE: 2
                };
                
                this.resetGame();
                this.setupEventListeners();
                this.gameLoop();
            }
            
            resetGame() {
                this.balls = [];
                this.bricks = [];
                this.powerUps = [];
                this.activePowerUps = new Set();
                
                // Initial ball - start above paddle
                this.balls.push({
                    x: this.windowWidth / 2,
                    y: this.windowHeight - 150,
                    dx: 4,
                    dy: -4,
                    color: this.colors[Math.floor(Math.random() * this.colors.length)],
                    active: true
                });
                
                this.paddleX = this.windowWidth / 2 - this.paddleWidth / 2;
                this.paddleY = this.windowHeight - 50;
                this.score = 0;
                this.gameOver = false;
                this.gameWon = false;
                
                this.moveLeft = false;
                this.moveRight = false;
                this.fastMoveLeft = false;
                this.fastMoveRight = false;
                
                this.paddleWidthPowerUpActive = false;
                this.paddleWidthTimer = 0;
                this.paddleWidth = 100;
                
                this.createBricks();
                this.hideGameOver();
                this.updateScore();
                this.updatePowerUpDisplay();
            }
            
            createBricks() {
                this.bricks = [];
                for (let i = 0; i < this.brickRows; i++) {
                    for (let j = 0; j < this.brickCols; j++) {
                        const brick = {
                            x: j * (this.brickWidth + 4) + 25,
                            y: i * (this.brickHeight + 4) + 50,
                            visible: true,
                            hasPower: Math.random() < 0.3,
                            color: this.colors[Math.floor(Math.random() * this.colors.length)],
                            row: i,
                            col: j
                        };
                        this.bricks.push(brick);
                    }
                }
                
                // Balance colors to maintain approximately 60/40 ratio
                this.balanceBrickColors();
            }
            
            balanceBrickColors() {
                let redCount = this.bricks.filter(b => this.colorsMatch(b.color, this.colors[0])).length;
                const totalBricks = this.bricks.length;
                const targetRed = Math.floor(totalBricks * 0.6);
                
                // Convert some bricks to red if needed
                while (redCount < targetRed) {
                    const randomBrick = this.bricks[Math.floor(Math.random() * this.bricks.length)];
                    if (this.colorsMatch(randomBrick.color, this.colors[1])) {
                        randomBrick.color = this.colors[0];
                        redCount++;
                    }
                }
            }
            
            setupEventListeners() {
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'a' || e.key === 'A') this.fastMoveLeft = true;
                    if (e.key === 'd' || e.key === 'D') this.fastMoveRight = true;
                    if (e.key === 'ArrowLeft') this.moveLeft = true;
                    if (e.key === 'ArrowRight') this.moveRight = true;
                    if ((e.key === 'r' || e.key === 'R') && this.gameOver) this.resetGame();
                    
                    // Prevent arrow keys from scrolling the page
                    if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) {
                        e.preventDefault();
                    }
                });
                
                document.addEventListener('keyup', (e) => {
                    if (e.key === 'a' || e.key === 'A') this.fastMoveLeft = false;
                    if (e.key === 'd' || e.key === 'D') this.fastMoveRight = false;
                    if (e.key === 'ArrowLeft') this.moveLeft = false;
                    if (e.key === 'ArrowRight') this.moveRight = false;
                });
            }
            
            updatePaddle() {
                let speed = 6;
                if (this.fastMoveLeft || this.fastMoveRight) speed = 12;
                
                if (this.fastMoveLeft || this.moveLeft) this.paddleX -= speed;
                if (this.fastMoveRight || this.moveRight) this.paddleX += speed;
                
                // Keep paddle within bounds
                this.paddleX = Math.max(0, Math.min(this.paddleX, this.windowWidth - this.paddleWidth));
                
                // Handle paddle width power-up timer
                if (this.paddleWidthPowerUpActive) {
                    if (Date.now() - this.paddleWidthTimer > 20000) {
                        this.paddleWidth = 100;
                        this.paddleWidthPowerUpActive = false;
                        this.activePowerUps.delete('wider_paddle');
                        this.updatePowerUpDisplay();
                    }
                }
            }
            
            updateBalls() {
                let brickBroken = false;
                
                for (const ball of this.balls) {
                    if (!ball.active) continue;
                    
                    // Store previous position for collision detection
                    const prevX = ball.x;
                    const prevY = ball.y;
                    
                    // Update position
                    ball.x += ball.dx;
                    ball.y += ball.dy;
                    
                    // Wall collisions
                    if (ball.x - this.ballRadius <= 0) {
                        ball.x = this.ballRadius;
                        ball.dx = Math.abs(ball.dx);
                    }
                    if (ball.x + this.ballRadius >= this.windowWidth) {
                        ball.x = this.windowWidth - this.ballRadius;
                        ball.dx = -Math.abs(ball.dx);
                    }
                    if (ball.y - this.ballRadius <= 0) {
                        ball.y = this.ballRadius;
                        ball.dy = Math.abs(ball.dy);
                    }
                    
                    // Bottom wall - ball lost
                    if (ball.y + this.ballRadius >= this.windowHeight) {
                        ball.active = false;
                        continue;
                    }
                    
                    // Paddle collision
                    if (ball.dy > 0) {
                        const nextY = ball.y + ball.dy;
                        
                        if (nextY + this.ballRadius >= this.paddleY && 
                            ball.y - this.ballRadius <= this.paddleY + this.paddleHeight &&
                            ball.x + this.ballRadius >= this.paddleX && 
                            ball.x - this.ballRadius <= this.paddleX + this.paddleWidth) {
                            
                            // Calculate hit point on paddle (0 = left, 1 = right)
                            const hitPoint = (ball.x - this.paddleX) / this.paddleWidth;
                            
                            // Calculate bounce angle based on hit point
                            const angle = (hitPoint - 0.5) * Math.PI / 3;
                            
                            // Calculate new direction
                            const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                            ball.dx = Math.sin(angle) * speed;
                            ball.dy = -Math.cos(angle) * speed;
                            
                            // Ensure minimum vertical speed
                            const minSpeed = 3;
                            if (Math.abs(ball.dy) < minSpeed) {
                                ball.dy = ball.dy > 0 ? minSpeed : -minSpeed;
                            }
                            
                            // Adjust ball position to be above paddle
                            ball.y = this.paddleY - this.ballRadius - 1;
                        }
                    }
                    
                    // Brick collisions
                    for (const brick of this.bricks) {
                        if (!brick.visible) continue;
                        
                        if (ball.x + this.ballRadius >= brick.x &&
                            ball.x - this.ballRadius <= brick.x + this.brickWidth &&
                            ball.y + this.ballRadius >= brick.y &&
                            ball.y - this.ballRadius <= brick.y + this.brickHeight) {
                            
                            // Determine collision side
                            const overlapLeft = ball.x + this.ballRadius - brick.x;
                            const overlapRight = brick.x + this.brickWidth - (ball.x - this.ballRadius);
                            const overlapTop = ball.y + this.ballRadius - brick.y;
                            const overlapBottom = brick.y + this.brickHeight - (ball.y - this.ballRadius);
                            
                            // Find minimum overlap to determine side
                            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                            
                            if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                                // Horizontal collision
                                ball.dx = -ball.dx;
                                if (minOverlap === overlapLeft) {
                                    ball.x = brick.x - this.ballRadius - 1;
                                } else {
                                    ball.x = brick.x + this.brickWidth + this.ballRadius + 1;
                                }
                            } else {
                                // Vertical collision
                                ball.dy = -ball.dy;
                                if (minOverlap === overlapTop) {
                                    ball.y = brick.y - this.ballRadius - 1;
                                } else {
                                    ball.y = brick.y + this.brickHeight + this.ballRadius + 1;
                                }
                            }
                            
                            // Check color match
                            if (this.colorsMatch(ball.color, brick.color)) {
                                brick.visible = false;
                                this.score += 10;
                                brickBroken = true;
                                if (brick.hasPower) this.spawnPowerUp(brick.x + this.brickWidth / 2, brick.y + this.brickHeight / 2);
                            }
                            
                            break;
                        }
                    }
                }
                
                // Change all ball colors when a brick is broken
                if (brickBroken) {
                    for (const ball of this.balls) {
                        if (ball.active) {
                            this.changeBallColor(ball);
                        }
                    }
                    this.updateScore();
                }
                
                // Check win condition
                const allBricksDestroyed = this.bricks.every(brick => !brick.visible);
                if (allBricksDestroyed && this.bricks.length > 0) {
                    this.gameWon = true;
                    this.gameOver = true;
                    this.showGameOver(true);
                }
                
                // Check lose condition
                const anyBallActive = this.balls.some(ball => ball.active);
                if (!anyBallActive && !this.gameWon && this.balls.length > 0) {
                    this.gameOver = true;
                    this.showGameOver(false);
                }
            }
            
            updatePowerUps() {
                for (const powerUp of this.powerUps) {
                    if (!powerUp.active) continue;
                    
                    powerUp.y += powerUp.speed;
                    
                    // Collision with paddle
                    if (powerUp.y + powerUp.size >= this.paddleY &&
                        powerUp.y <= this.paddleY + this.paddleHeight &&
                        powerUp.x >= this.paddleX && 
                        powerUp.x <= this.paddleX + this.paddleWidth) {
                        powerUp.active = false;
                        this.applyPowerUp(powerUp.type);
                    }
                    
                    // Remove if below screen
                    if (powerUp.y > this.windowHeight) {
                        powerUp.active = false;
                    }
                }
                
                // Remove inactive power-ups
                this.powerUps = this.powerUps.filter(powerUp => powerUp.active);
            }
            
            spawnPowerUp(x, y) {
                if (Math.random() < 0.4) {
                    const powerUp = {
                        x: x,
                        y: y,
                        active: true,
                        type: Math.floor(Math.random() * 3),
                        speed: 2,
                        size: 12
                    };
                    this.powerUps.push(powerUp);
                }
            }
            
            applyPowerUp(type) {
                switch (type) {
                    case this.POWERUP_TYPES.SPEED:
                        this.activePowerUps.add('speed_boost');
                        for (const ball of this.balls) {
                            if (ball.active) {
                                const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                                const speedMultiplier = 1.3;
                                ball.dx = (ball.dx / currentSpeed) * (currentSpeed * speedMultiplier);
                                ball.dy = (ball.dy / currentSpeed) * (currentSpeed * speedMultiplier);
                            }
                        }
                        setTimeout(() => {
                            this.activePowerUps.delete('speed_boost');
                            this.updatePowerUpDisplay();
                        }, 10000);
                        break;
                        
                    case this.POWERUP_TYPES.MULTIBALL:
                        this.activePowerUps.add('multiball');
                        this.splitBalls();
                        setTimeout(() => {
                            this.activePowerUps.delete('multiball');
                            this.updatePowerUpDisplay();
                        }, 5000);
                        break;
                        
                    case this.POWERUP_TYPES.WIDER_PADDLE:
                        this.activePowerUps.add('wider_paddle');
                        this.paddleWidth = Math.min(this.paddleWidth + 50, 200);
                        this.paddleWidthPowerUpActive = true;
                        this.paddleWidthTimer = Date.now();
                        break;
                }
                this.updatePowerUpDisplay();
            }
            
            splitBalls() {
                if (this.balls.length >= this.maxBalls) return;
                
                const newBalls = [];
                for (const ball of this.balls) {
                    if (ball.active && newBalls.length + this.balls.length < this.maxBalls) {
                        const newBall = { 
                            ...ball,
                            dx: -ball.dx * 1.1,
                            dy: ball.dy * 1.1
                        };
                        newBalls.push(newBall);
                    }
                }
                this.balls.push(...newBalls);
            }
            
            changeBallColor(ball) {
                ball.color = this.colors[Math.floor(Math.random() * this.colors.length)];
            }
            
            colorsMatch(c1, c2) {
                const eps = 0.01;
                return Math.abs(c1.r - c2.r) < eps && 
                       Math.abs(c1.g - c2.g) < eps && 
                       Math.abs(c1.b - c2.b) < eps;
            }
            
            draw() {
                // Clear canvas with dark blue background
                this.ctx.fillStyle = '#0c2461';
                this.ctx.fillRect(0, 0, this.windowWidth, this.windowHeight);
                
                // Draw bricks
                for (const brick of this.bricks) {
                    if (!brick.visible) continue;
                    
                    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                    this.ctx.shadowBlur = 5;
                    this.ctx.shadowOffsetX = 2;
                    this.ctx.shadowOffsetY = 2;
                    
                    this.ctx.fillStyle = `rgb(${brick.color.r * 255}, ${brick.color.g * 255}, ${brick.color.b * 255})`;
                    this.ctx.fillRect(brick.x, brick.y, this.brickWidth, this.brickHeight);
                    
                    // Brick highlight
                    this.ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
                    this.ctx.fillRect(brick.x, brick.y, this.brickWidth, 3);
                    
                    this.ctx.shadowColor = 'transparent';
                    this.ctx.shadowBlur = 0;
                    this.ctx.shadowOffsetX = 0;
                    this.ctx.shadowOffsetY = 0;
                    
                    // Brick border
                    this.ctx.strokeStyle = '#2c3e50';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(brick.x, brick.y, this.brickWidth, this.brickHeight);
                }
                
                // Draw balls with glow effect
                for (const ball of this.balls) {
                    if (!ball.active) continue;
                    
                    // Ball glow
                    this.ctx.shadowColor = `rgb(${ball.color.r * 255}, ${ball.color.g * 255}, ${ball.color.b * 255})`;
                    this.ctx.shadowBlur = 15;
                    
                    // Ball body
                    this.ctx.fillStyle = `rgb(${ball.color.r * 255}, ${ball.color.g * 255}, ${ball.color.b * 255})`;
                    this.ctx.beginPath();
                    this.ctx.arc(ball.x, ball.y, this.ballRadius, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Ball highlight
                    this.ctx.shadowBlur = 0;
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                    this.ctx.beginPath();
                    this.ctx.arc(ball.x - 3, ball.y - 3, this.ballRadius / 3, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                // Draw paddle
                this.ctx.fillStyle = '#34495e';
                this.ctx.fillRect(this.paddleX, this.paddleY, this.paddleWidth, this.paddleHeight);
                
                // Draw paddle highlight
                this.ctx.fillStyle = '#2c3e50';
                this.ctx.fillRect(this.paddleX, this.paddleY, this.paddleWidth, 3);
                
                // Draw power-ups
                for (const powerUp of this.powerUps) {
                    if (!powerUp.active) continue;
                    
                    let color;
                    switch (powerUp.type) {
                        case this.POWERUP_TYPES.SPEED: color = '#e74c3c'; break;
                        case this.POWERUP_TYPES.MULTIBALL: color = '#27ae60'; break;
                        case this.POWERUP_TYPES.WIDER_PADDLE: color = '#3498db'; break;
                    }
                    
                    // Power-up glow
                    this.ctx.shadowColor = color;
                    this.ctx.shadowBlur = 10;
                    
                    // Power-up body with pulsing effect
                    const pulse = Math.sin(Date.now() * 0.01) * 1.5;
                    this.ctx.fillStyle = color;
                    this.ctx.beginPath();
                    this.ctx.arc(powerUp.x, powerUp.y, powerUp.size + pulse, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    this.ctx.shadowBlur = 0;
                    
                    // Power-up icon
                    this.ctx.fillStyle = 'white';
                    this.ctx.font = 'bold 10px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    
                    let symbol = '⚡';
                    switch (powerUp.type) {
                        case this.POWERUP_TYPES.SPEED: symbol = '⚡'; break;
                        case this.POWERUP_TYPES.MULTIBALL: symbol = '🎯'; break;
                        case this.POWERUP_TYPES.WIDER_PADDLE: symbol = '📏'; break;
                    }
                    
                    this.ctx.fillText(symbol, powerUp.x, powerUp.y);
                }
                
                this.ctx.shadowBlur = 0;
            }
            
            updateScore() {
                this.scoreElement.textContent = this.score;
            }
            
            showGameOver(isWin) {
                this.finalScoreElement.textContent = this.score;
                this.gameOverTitle.textContent = isWin ? '🎉 You Win! 🎉' : '💀 Game Over';
                this.gameOverTitle.style.color = isWin ? '#27ae60' : '#e74c3c';
                this.gameOverElement.classList.remove('hidden');
            }
            
            hideGameOver() {
                this.gameOverElement.classList.add('hidden');
            }
            
            updatePowerUpDisplay() {
                if (this.activePowerUps.size === 0) {
                    this.activePowerUpsElement.textContent = 'No active power-ups';
                    this.activePowerUpsElement.className = 'power-ups-display';
                } else {
                    let html = 'Active: ';
                    const powerUps = [];
                    
                    if (this.activePowerUps.has('speed_boost')) powerUps.push('⚡ Speed');
                    if (this.activePowerUps.has('multiball')) powerUps.push('🎯 Multi-ball');
                    if (this.activePowerUps.has('wider_paddle')) powerUps.push('📏 Wide Paddle');
                    
                    html += powerUps.join(', ');
                    this.activePowerUpsElement.innerHTML = html;
                    this.activePowerUpsElement.className = 'power-ups-display active';
                }
            }
            
            gameLoop() {
                if (!this.gameOver) {
                    this.updatePaddle();
                    this.updateBalls();
                    this.updatePowerUps();
                    this.draw();
                }
                requestAnimationFrame(() => this.gameLoop());
            }
        }

        // Start the game when page loads
        window.addEventListener('load', () => {
            new ColorMatchBrickBreaker();
        });