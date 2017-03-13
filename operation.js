var canvas1 = document.getElementById("canvas1"),
	context1 = canvas1.getContext("2d");

var blockWidth = 20,        			//俄罗斯方块每格宽
	t,                      			//俄罗斯方块
	TT,									//在canvas2中显示的下个俄罗斯方块
	speed = 2,							//下落速度
	isStopped = false, 					//标记每一个俄罗斯方块生命周期是否结束
	color,								//每个俄罗斯方块颜色
	tempColor,
	array = [],
	colors = ["yellow", "lime", "cyan", "fuchsia", "red", "dimgray", "darkorchid"],
	shapes = [
		[ [-1, -1], [0, -1], [0, 0], [1, 0] ],     //正S
		[ [-1, 0], [0, -1], [0, 0], [1, -1] ],     //倒S
		[ [-1, -1], [-1, 0], [0, 0], [1, 0] ],     //正L
		[ [-1, 0], [0, 0], [1, -1], [1, 0] ],      //倒L
		[ [0, -1], [0, 0], [1, -1], [1, 0] ],      //田
		[ [-1, 1], [0, 0], [0, 1], [1, 1] ],   	   //土
		[ [-2, 0], [-1, 0], [0, 0], [1, 0] ]       //一
	],
	colorNum = 0,						//随机生成的颜色
	shapeNum = 0,          				//随机生成的形状	
	tempShapeNum = 0,
	tempColorNum = 0,
	temp,								//存放setTimeout
	temp1,
	clock = 0,							//显示时间
	score = 0;							//分数

/*图对象
	
	变量：
		1.每个格子的状态（对象，含颜色和是否被占用属性）
	方法：
		1.初始化图
		2.判断一行是否满了
		3.消除一行
		4.整个图行下移*/
var map = {
	blockStatus: [],
	initMap: function() {
		for (var i = -3; i < (canvas1.height - 1) / blockWidth; i++) {
			this.blockStatus[i] = [];
			for (var j = 0; j < (canvas1.width - 1) / blockWidth; j++) {
				this.blockStatus[i][j] = {};
				this.blockStatus[i][j].isOccupied = false;
				this.blockStatus[i][j].blockColor = "white";
			}
		}
		this.blockStatus[(canvas1.height - 1) / blockWidth] = [];
		context1.clearRect(0, 0, canvas1.width, canvas1.height);
	},
	isLineFull: function(line) {
		for (var i = 0; i < (canvas1.width - 1) / blockWidth; i++) {
			if (!this.blockStatus[line][i].isOccupied)
				return false;
		}
		return true;
	},
	clearLine: function(line) {
		if (this.isLineFull(line)) {
			context1.clearRect(0, line * blockWidth, canvas1.width, blockWidth);
			this.moveMapDown(line);
			score += 20;
			context3.clearRect(0, canvas3.height / 3, canvas3.width, canvas3.height * 2 / 3);
			context3.fillText(score, canvas3.width / 2, canvas3.height / 2);
		}
	},
	moveMapDown: function(line) {
		for (var i = line; i >= 0; i--) {
			for (var j = 0; j < (canvas1.width - 1) / blockWidth; j++) {
				map.blockStatus[i][j].blockColor = map.blockStatus[i - 1][j].blockColor;
				map.blockStatus[i][j].isOccupied = map.blockStatus[i - 1][j].isOccupied;
				context1.save();
				context1.fillStyle = map.blockStatus[i][j].blockColor;
				context1.fillRect(j * blockWidth + 1, i * blockWidth + 1, blockWidth - 1, blockWidth - 1);
				context1.restore();
			}
		}
	}
};

/*俄罗斯方块对象

	变量：
		1.自身坐标系坐标
		2.全局坐标系坐标
		3.初始坐标原点
	方法：
		1.创建方块
		2.坐标转换
		3.下移
		4.左移
		5.右移
		6.旋转
		7.直下*/
var Tetris = function() {  
	this.shape = [[], [], [], []];                               		//每个俄罗斯方块形状坐标
	this.coordinate = [[], [], [], []];					  	  			//每个俄罗斯方块在图中的坐标
	this.origin = [(canvas1.width - 1) / 2, -blockWidth];      //每个俄罗斯方块的坐标原点初始地址      
};

Tetris.prototype.creatTetirs = function(shapeNum) {			  	
	for (var i = 0; i < shapeNum.length; i++) {
		this.shape[i][0] = shapeNum[i][0];
		this.shape[i][1] = shapeNum[i][1];
	}
	this.changeCoordinate(this.shape);
};

Tetris.prototype.changeCoordinate = function(shape) {		  
	for (var i = 0; i < shape.length; i++) {
		this.coordinate[i][0] = shape[i][0] * blockWidth + this.origin[0];
		this.coordinate[i][1] = shape[i][1] * -1 * blockWidth + this.origin[1];  
	}
};

Tetris.prototype.moveDown = function() {
	var collision = 0;							//平移过程中是否发生碰撞，没有为0，有为1	
	for (var i = 0; i < 4; i++) {
		if (map.blockStatus[this.coordinate[i][1] / blockWidth + 1][this.coordinate[i][0] / blockWidth] === undefined || map.blockStatus[this.coordinate[i][1] / blockWidth + 1][this.coordinate[i][0] / blockWidth].isOccupied) {
			collision = 1;
			isStopped = true;
			break;
		}
	}
	if (collision === 0) {
		context1.beginPath();
		context1.save();
		for (var i = 0; i < 4; i++) {
			context1.rect(this.coordinate[i][0], this.coordinate[i][1], blockWidth, blockWidth);
			this.coordinate[i][1] += blockWidth;
		}
		context1.clip();
		context1.clearRect(0, 0, canvas1.width, canvas1.height);
		context1.restore();
		this.origin[1] += blockWidth;
		this.drawTetris(color);
	}
};

Tetris.prototype.moveLeft = function() {
	var collision = 0;
	isStopped = false;
	for (var i = 0; i < 4; i++) {
		if (map.blockStatus[this.coordinate[i][1] / blockWidth][this.coordinate[i][0] / blockWidth - 1] === undefined || map.blockStatus[this.coordinate[i][1] / blockWidth][this.coordinate[i][0] / blockWidth - 1].isOccupied) {
			collision = 1;
			break;
		}
	}
	if (collision === 0) {
		context1.beginPath();
		context1.save();
		for (var i = 0; i < 4; i++) {
			context1.rect(this.coordinate[i][0], this.coordinate[i][1], blockWidth, blockWidth);
			this.coordinate[i][0] -= blockWidth;
			if (map.blockStatus[this.coordinate[i][1] / blockWidth + 1][this.coordinate[i][0] / blockWidth] === undefined || map.blockStatus[this.coordinate[i][1] / blockWidth + 1][this.coordinate[i][0] / blockWidth].isOccupied) {
				isStopped = true;
			}
		}
		context1.clip();
		context1.clearRect(0, 0, canvas1.width, canvas1.height);
		context1.restore();
		this.origin[0] -= blockWidth;
		this.drawTetris(color);
	}
};

Tetris.prototype.moveRight = function() {
	var collision = 0;
	isStopped = false;
	for (var i = 0; i < 4; i++) {
		if (map.blockStatus[this.coordinate[i][1] / blockWidth][this.coordinate[i][0] / blockWidth + 1] === undefined || map.blockStatus[this.coordinate[i][1] / blockWidth][this.coordinate[i][0] / blockWidth + 1].isOccupied) {
			collision = 1;
			break;
		}
	}
	if (collision === 0) {
		context1.beginPath();
		context1.save();
		for (var i = 0; i < 4; i++) {
			context1.rect(this.coordinate[i][0], this.coordinate[i][1], blockWidth, blockWidth);
			this.coordinate[i][0] += blockWidth;
			if (map.blockStatus[this.coordinate[i][1] / blockWidth + 1][this.coordinate[i][0] / blockWidth] === undefined || map.blockStatus[this.coordinate[i][1] / blockWidth + 1][this.coordinate[i][0] / blockWidth].isOccupied) {
				isStopped = true;
			}
		}
		context1.clip();
		context1.clearRect(0, 0, canvas1.width, canvas1.height);
		context1.restore();
		this.origin[0] += blockWidth;
		this.drawTetris(color);
	}
};

Tetris.prototype.rotate = function() {
	var collision = 0,
		tempShape = [[], [], [], []],
		tempCoordinate = [[], [], [], []];
	isStopped = false;
	for (var i = 0; i < 4; i++) {
		tempShape[i][0] = this.shape[i][1];
		tempShape[i][1] = -1 * this.shape[i][0];
		tempCoordinate[i][0] = tempShape[i][0] * blockWidth + this.origin[0];
		tempCoordinate[i][1] = tempShape[i][1] * blockWidth * -1 + this.origin[1];
		if (shapeNum === 4 || map.blockStatus[tempCoordinate[i][1] / blockWidth][tempCoordinate[i][0] / blockWidth] === undefined || map.blockStatus[tempCoordinate[i][1] / blockWidth][tempCoordinate[i][0] / blockWidth].isOccupied) {
			collision = 1;
			break;
		}
	}
	if (collision === 0) {
		context1.beginPath();
		context1.save();
		for (var i = 0; i < 4; i++) {
			context1.rect(this.coordinate[i][0], this.coordinate[i][1], blockWidth, blockWidth);
			this.shape[i][0] = tempShape[i][0];
			this.shape[i][1] = tempShape[i][1];
			this.coordinate[i][0] = tempCoordinate[i][0];
			this.coordinate[i][1] = tempCoordinate[i][1];
			if (map.blockStatus[this.coordinate[i][1] / blockWidth + 1][this.coordinate[i][0] / blockWidth] === undefined || map.blockStatus[this.coordinate[i][1] / blockWidth + 1][this.coordinate[i][0] / blockWidth].isOccupied) {
				isStopped = true;
			}
		}
		context1.clip();
		context1.clearRect(0, 0, canvas1.width, canvas1.height);
		context1.restore();
		this.drawTetris(color);
	}
};

Tetris.prototype.moveToBottom = function() {
	var length = (canvas1.height - 1) / blockWidth - 1;						//整体下移的距离
	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < (canvas1.height - 1) / blockWidth; j++) {
			if (map.blockStatus[j][this.coordinate[i][0] / blockWidth].isOccupied && (j - this.coordinate[i][1] / blockWidth - 1) < length) {
				length = j - this.coordinate[i][1] / blockWidth - 1;
				break;
			}
		}
	}
	if (length === (canvas1.height - 1) / blockWidth - 1) {
		for (var i = 0; i < 4; i++) {
			length = ((canvas1.height - 1) / blockWidth - this.coordinate[i][1] / blockWidth - 1) < length ? ((canvas1.height - 1) / blockWidth - this.coordinate[i][1] / blockWidth - 1) : length;
		}
	}
	if (length === 0 && !isStopped) {             //判断方块是否没有位置降落和是否停止
		game.isOver = true;
	} else {
		context1.beginPath();
		context1.save();
		for (var i = 0; i < 4; i++) {
			context1.rect(this.coordinate[i][0], this.coordinate[i][1], blockWidth, blockWidth);
			this.coordinate[i][1] += length * blockWidth;
		}
		context1.clip();
		context1.clearRect(0, 0, canvas1.width, canvas1.height);
		context1.restore();
		this.origin[1] += length * blockWidth;
		this.drawTetris(color);
	}
	isStopped = true;
};

Tetris.prototype.drawTetris = function(fillColor) {
	context1.save();
	context1.fillStyle = fillColor;
	for (var i = 0; i < 4; i++) {
		context1.fillRect(this.coordinate[i][0] + 1, this.coordinate[i][1] + 1, blockWidth - 1, blockWidth - 1);
	}
	context1.restore();
};

Tetris.prototype.drawNext = function(fillColor) {
	context2.save();
	context2.fillStyle = fillColor;
	context2.clearRect(0, 0, canvas2.width, canvas2.height);
	for (var i = 0; i < 4; i++) {
		context2.fillRect(this.shape[i][0] * blockWidth + 60 + 1, this.shape[i][1] * -1 * blockWidth + 35 + 1, blockWidth - 1, blockWidth - 1);
	}
	context2.restore();
};

/*游戏对象
	
	变量：
		1.游戏时间
		2.是否暂停状态
	方法：
		1.初始化游戏
		2.暂停游戏
		3.停止游戏*/
var game = {
	isOver : false, 
	initGame : function() {
		context1.clearRect(0, 0, canvas1.width, canvas1.height);
		map.initMap();
		context3.fillStyle = "black";
		context3.fillRect(0, 0, canvas3.width, canvas3.height / 3);
		context3.textAlign = "center";
		context3.textBaseline = "top";
		context3.font = "1.5em century";
		context3.save();
		context3.fillStyle = "white";
		context3.textBaseline = "middle";
		context3.fillText("Score", canvas3.width / 2, canvas3.height / 6);
		context3.restore();
		context3.fillText(score, canvas3.width / 2, canvas3.height / 2);
		context4.fillStyle  = "black";
		context4.fillRect(0, 0, canvas4.width, canvas4.height / 3);
		context4.textAlign = "center";
		context4.textBaseline = "top";
		context4.font = "1.5em century";
		context4.save();
		context4.fillStyle = "white";
		context4.textBaseline = "middle";
		context4.fillText("Time", canvas4.width / 2, canvas4.height / 6);
		context4.restore();
		context4.fillText(clock, canvas4.width / 2, canvas4.height / 2);
	},
	startGame : function() {
			speed = speed * document.getElementById("speeed").elements[0].value;
			colorNum = Math.floor(Math.random() * 7);
			shapeNum = Math.floor(Math.random() * 7);
			color = colors[colorNum];								//随机产生一个颜色
			t = new Tetris();										//新建一个俄罗斯方块
			t.creatTetirs(shapes[shapeNum]);						//创建坐标
			tempColorNum = Math.floor(Math.random() * 7);  
			tempShapeNum = Math.floor(Math.random() * 7);
			tempColor = colors[tempColorNum];
			TT = new Tetris();										//创建一个临时方块用于绘制下一个出现的图形
			TT.creatTetirs(shapes[tempShapeNum]);
			window.addEventListener("keydown", keyDown, false);		//监听键盘事件						
			temp1 = setInterval(timeLoop, 1000);
			temp = setInterval(animate, 1000 / speed);
	}
};

window.onload = function() {
	game.initGame();
}

function sort(tempArray) {
	var m = 0;
	for (var i = 0; i < tempArray.length - 1; i++) {
		for (var j = 0; j < tempArray.length - i - 1; j++) {
			if (tempArray[j] < tempArray[j + 1]) {
				m = tempArray[j + 1];
				tempArray[j + 1] = tempArray[j];
				tempArray[j] = m;
			}
		}
	}
}

function animate() {
	if (!game.isOver) {											//判断游戏是否结束
		if (!isStopped) {										//判断一个俄罗斯方块是否停止
			t.moveDown();
			TT.drawNext(tempColor);								//在canvas2中绘制下一个出现的方块
		} else {
			var flag = 0;										//游戏结束的标志，结束为0
			var tempTetris = new Tetris();
			tempTetris.creatTetirs(t.shape);
			for (var i = 0; i < 4; i++) {                       //判断初始方块是否不能下落
				if (tempTetris.coordinate[i][0] !== t.coordinate[i][0] || tempTetris.coordinate[i][1] !== t.coordinate[i][1]) {
					flag = 1;
					break;
				}
			}
			if (flag === 0) {									//游戏结束
				game.isOver = true;					
				console.log("1111");
				clearInterval(temp1);
				window.removeEventListener("keydown", keyDown, false);
				context1.clearRect(0, 0, canvas1.width, canvas1.height);
				context1.fillStyle = "black";
				context1.textAlign = "center";
				context1.textBaseline = "center";
				context1.font = "2em century";
				context1.fillText("Game Over!", canvas1.width / 2, canvas1.height / 2);
				console.log("over");
			} else {
				for (var i = 0; i < 4; i++) {   //把方块停止的地方涂色
					map.blockStatus[t.coordinate[i][1] / blockWidth][t.coordinate[i][0] / blockWidth].blockColor = color;
					map.blockStatus[t.coordinate[i][1] / blockWidth][t.coordinate[i][0] / blockWidth].isOccupied = true;
					array[i] = t.coordinate[i][1] / blockWidth;
					context1.save();
					context1.fillStyle = color;
					context1.fillRect(t.coordinate[i][0] + 1, t.coordinate[i][1] + 1, blockWidth - 1, blockWidth - 1);
					context1.restore();
				}
				sort(array);
				for (var i = 0; i < 4; i++) {
					if (array[i] < (canvas1.height - 1) / blockWidth && map.isLineFull(array[i])) {
						map.clearLine(array[i]);
						for (var j = i + 1; j < array.length; j++) {
							array[j] += 1;
						}
					}
				}
				color = tempColor;
				shapeNum = tempShapeNum;
				t = new Tetris();
				t.creatTetirs(shapes[shapeNum]);
				tempColorNum = Math.floor(Math.random() * 7);		//生成下下个图形
				tempShapeNum = Math.floor(Math.random() * 7);
				tempColor = colors[tempColorNum];
				TT.creatTetirs(shapes[tempShapeNum]);
			}
			isStopped = false;
		}
	} else clearInterval(temp);
}

function timeLoop() {
	clock++;
	context4.clearRect(0, canvas4.height / 3, canvas4.width, canvas4.height * 2 / 3);
	context4.fillText(clock, canvas4.width / 2, canvas4.height / 2);
}

function keyDown(e) {
	switch (e.keyCode) {
		case 32: t.moveToBottom(); break;
		case 37: t.moveLeft();     break;
		case 38: t.rotate();       break;
		case 39: t.moveRight();    break;
		case 40: t.moveDown();     break;
	}
}

var canvas2 = document.getElementById("canvas2"),
	context2 = canvas2.getContext("2d");

var canvas3 = document.getElementById("canvas3"),
	context3 = canvas3.getContext("2d");

var canvas4 = document.getElementById("canvas4"),
	context4 = canvas4.getContext("2d");

