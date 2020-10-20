let canvas = document.getElementById('canvas'),
	ctx = canvas.getContext('2d'),
	width = canvas.width,
	height = canvas.height,
	blockSize = 10,
	widthInBlocks = width / blockSize,
	heightInBlocks = height / blockSize,
	score = 0;	

function drawBorder(){
	ctx.fillStyle = 'Gray';
	ctx.fillRect(0, 0, width, blockSize);
	ctx.fillRect(0, height - blockSize, width, blockSize);
	ctx.fillRect(0, 0, blockSize, height);
	ctx.fillRect(width - blockSize, 0, blockSize, height);
};

function drawScore(){
	ctx.textBaseline = 'top';
	ctx.textAlign = 'left';
	ctx.font = '20px Courier';
	ctx.fillStyle = 'Black';
	ctx.fillText('Счет: ' + score, blockSize, blockSize);
};

function circle(x, y, radius, fillCircle){
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2, false);
	if(fillCircle){
		ctx.fill();
	}else{
		ctx.stroke();
	}
};

function Block(col, row){
	this.col = col;
	this.row = row;
};

Block.prototype.drawSquare = function(color){
	let x = this.col * blockSize,
		y = this.row * blockSize;

	ctx.fillStyle = color;
	ctx.fillRect(x, y, blockSize, blockSize);
}

Block.prototype.drawCircle = function(color){
	let centerX = this.col * blockSize + blockSize / 2,
		centerY = this.row * blockSize + blockSize / 2;

	ctx.fillStyle = color;
	circle(centerX, centerY, blockSize / 2, true);
};

Block.prototype.equal = function(otherBlock){
	return this.col === otherBlock.col && this.row === otherBlock.row;
};

function gameOver(){
	playning = false;
	ctx.font = '60px Courier';
	ctx.fillStyle = 'Black',
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText('Конец игры', width / 2, height / 2);
};

function Snake(){
	this.segments = [
		new Block(7, 5),
		new Block(6, 5),
		new Block(5, 5)
	];

	this.direction = 'right';
	this.nextDirection = 'right';
};

Snake.prototype.draw = function(){
	this.segments[0].drawSquare('LimeGreen');
	let isEvenSegment = false;

	for(var i = 1; i < this.segments.length; i++){
		if(isEvenSegment){
			this.segments[i].drawSquare('Blue');
		}else{
			this.segments[i].drawSquare('Yellow');
		}

		isEvenSegment = !isEvenSegment;
	}
};

Snake.prototype.move = function(){
	let head = this.segments[0],
		newHead;

	this.direction = this.nextDirection;

	if(this.direction === 'right'){
		newHead = new Block(head.col + 1, head.row);
	}else if(this.direction === 'down'){
		newHead = new Block(head.col, head.row + 1);
	}else if(this.direction === 'left'){
		newHead = new Block(head.col - 1, head.row);
	}else if(this.direction === 'up'){
		newHead = new Block(head.col, head.row - 1);
	}

	if(this.checkCollision(newHead)){
		gameOver();
		return;
	}

	this.segments.unshift(newHead);

	if(newHead.equal(apple.position)){
		score++;
		animationTime -= 5;
		apple.move(this.segments);
	}else{
		this.segments.pop();
	}
};

Snake.prototype.checkCollision = function(head){
	let leftCollision = (head.col === 0),
		topCollision = (head.row === 0),
		rightCollision = (head.col === widthInBlocks - 1),
		bottomCollision = (head.row === heightInBlocks - 1),
		wallCollision = leftCollision || topCollision || rightCollision || bottomCollision,
		selfCollision = false;

		for(var i = 0; i < this.segments.length; i++){
			if(head.equal(this.segments[i])){
				selfCollision = true;
			}
		}

	return wallCollision || selfCollision;
};

Snake.prototype.setDirection = function(newDirection){
	if(this.direction === 'up' && newDirection === 'down'){
		return;
	}else if(this.direction === 'right' && newDirection === 'left'){
		return;
	}else if(this.direction === 'down' && newDirection === 'up'){
		return;
	}else if(this.direction === 'left' && newDirection === 'right'){
		return;
	}
	this.nextDirection = newDirection;
};

function Apple(){
	this.position = new Block(10, 10);
}

Apple.prototype.draw = function(){
	this.position.drawCircle('LimeGreen');
}

Apple.prototype.move = function(occupiedBlocks){
	let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1,
		randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1,
		index = occupiedBlocks.length - 1;
		this.position = new Block(randomCol, randomRow);

	while(index >= 0){
		if(this.position.equal(occupiedBlocks[index])){
			this.move(occupiedBlocks);
			return;
		}

		index--;
	}
};

let snake = new Snake(),
	apple = new Apple(),
	playing = true,
	animationTime = 100;

function gameLoop(){
	ctx.clearRect(0, 0, width, height);
	drawScore();
	snake.move();
	snake.draw();
	apple.draw();
	drawBorder();

	if(playing){
		setTimeout(gameLoop, animationTime);
	}
}

gameLoop();

let directions = {
	37: 'left',
	38: 'up',
	39: 'right',
	40: 'down'
};

$('body').keydown(function(event){
	let newDirection = directions[event.keyCode];
	if(newDirection !== undefined){
		snake.setDirection(newDirection);
	}
});