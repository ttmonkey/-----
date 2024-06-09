const rankDom = document.getElementById("rank");
const scoreDom = document.getElementById("score");
const startDom = document.getElementById("start");
const pauseDom = document.getElementById("pause");
const resetDom = document.getElementById("restart");
const speedDom = document.getElementById("speed");
const textureDom = document.getElementById("texture");
const colorDom = document.querySelectorAll(".colors");

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const WIDTH = 300;
const HEIGHT = 500;
// 每一个是25*25px
context.scale(25, 25);

// 绘制下一块方块的区域
const nextCanvas = document.getElementById("nextBlock");
const nextContext = nextCanvas.getContext("2d");
const NEXTWIDTH = 100;
const NEXTHEIGHT = 100;
nextContext.scale(25, 25);

// 颜色
let colors = [
    null,
    "#e6e34f",
    "#e99a50",
    "#dd3b9c",
    "#4fd388",
    "#d13f3d",
    "#4bbad3"
]

// 方块的类型
let types = new Array();
// 方块纹理
let texture;

// 方块
class Block {
    constructor(color) {
        this.x = 0;
        this.y = -2;
        this.nexty = 0;// 用于绘制下一个方块
        this.color = color;
        this.state = 0;
    }

    // 左移
    moveleft() {
        // this.x -= 1;
        const nextBlockpos = {
            ...this
        };
        nextBlockpos.x -= 1;
        if (collide(arena, nextBlockpos)) return;
        this.x -= 1;
    }

    // 右移
    moveright() {
        // this.x += 1;
        const nextBlockpos = {
            ...this
        };
        nextBlockpos.x += 1;
        if (collide(arena, nextBlockpos)) return;
        this.x += 1;
    }

    // 下移
    movedown() {
        // this.y += 1;
        const nextBlockpos = {
            ...this
        };
        nextBlockpos.y += 1;
        if (collide(arena, nextBlockpos)) return;
        this.y = nextBlockpos.y;
    }

    // 翻转
    rotate() {
        const copy = JSON.parse(JSON.stringify(this.shape));
        const next = JSON.parse(JSON.stringify(this.shape));

        for (let i = 0; i < next.length; i++) {
            for (let j = 0; j < next[i].length; j++) {
                next[j][i] = copy[i][j];
            }
        }
        next.forEach((r) => r.reverse());
        const nextblock = {
            ...this
        };
        nextblock.shape = next;
        if (collide(arena, nextblock)) return;
        this.shape = next;
    }
}

class IBlock extends Block {
    constructor(color) {
        super(color);
        this.shape = [
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [1, 0, 0, 0],
        ]
        this.y = -3;
        // console.log("创建一个I块")
    }
}

class OBlock extends Block {
    constructor(color) {
        super(color);
        this.shape = [
            [2, 2],
            [2, 2],
        ]
        this.y = -1;
        this.nexty = 1;
        // console.log("创建一个O块")
    }
}

class LBlock extends Block {
    constructor(color) {
        super(color);
        this.shape = [
            [3, 0, 0],
            [3, 0, 0],
            [3, 3, 0],
        ]
        // console.log("创建一个L块")
    }
}

class JBlock extends Block {
    constructor(color) {
        super(color);
        this.shape = [
            [4, 4, 0],
            [4, 0, 0],
            [4, 0, 0],
        ]
        // console.log("创建一个J块")
    }
}

class SBlock extends Block {
    constructor(color) {
        super(color);
        this.shape = [
            [5, 0, 0],
            [5, 5, 0],
            [0, 5, 0],
        ]
        // console.log("创建一个S块")
    }
}

class ZBlock extends Block {
    constructor(color) {
        super(color);
        this.shape = [
            [0, 6, 0],
            [6, 6, 0],
            [6, 0, 0],
        ]
        // console.log("创建一个Z块")
    }
}

class TBlock extends Block {
    constructor(color) {
        super(color);
        this.shape = [
            [0, 0, 0],
            [7, 7, 7],
            [0, 7, 0],
        ]
        // console.log("创建一个T块")
    }
}


let nowBlock = null;// 当前方块
let nextBlock;// 下一个方块
let score;// 分数
let arena;// 记录数组

let lastTime = 0;// 上一帧的时间
let dropCounter = 0;// 计数器
let dropInterval = 1000;// 下落时间间隔

let requestAnimationFrameId = null;

initDraw();

function initDraw() {
    arena = createMatrix(12, 20);
    score = 0;
    updateScore();
    resetCanvas();
    drawMatrix(arena);
    drawNet();
    drawNextNet();
}

// 游戏区
// Array.from生成二维数组
// 空格子，对应的数组为0 ，有方块的对应1
function createMatrix(w, h) {
    const matrix = Array.from(new Array(h), () => {
        return new Array(w).fill(0)
    });
    return matrix;
}

// 绘制游戏界面
function draw() {
    // 清空画布
    resetCanvas();
    // 绘制当前落下的方块
    drawBlock();
    // 绘制整个网格，包括已经固定的方块
    drawMatrix(arena);
    // 背景网格
    drawNet();
}

// 绘制下一块方块那个区域
function drawNext() {
    resetNextCanvas();
    drawNextBlock();
    drawNextNet();
}

// 绘画背景中的格子
function drawNet() {
    context.strokeStyle = "#ffffff16"
    context.lineWidth = 0.1
    context.beginPath()

    for (let i = 1; i < 12; i++) {
        context.moveTo(i, 0)
        context.lineTo(i, 500)
    }
    for (let i = 1; i < 20; i++) {
        context.moveTo(0, i)
        context.lineTo(300, i)
    }
    context.stroke()

}

function drawNextNet() {
    nextContext.strokeStyle = "#eee"
    nextContext.lineWidth = 0.1
    nextContext.beginPath()

    for (let i = 1; i < 4; i++) {
        nextContext.moveTo(i, 0)
        nextContext.lineTo(i, 100)
    }
    for (let i = 1; i < 4; i++) {
        nextContext.moveTo(0, i)
        nextContext.lineTo(100, i)
    }
    nextContext.stroke()
}

// 随机生成一个方块
function createBlock() {
    const n = types.length;
    const index = Math.floor(Math.random() * n);
    const blockIndex = types[index];
    const colorIndex = Math.floor(Math.random() * 6 + 1);
    // console.log(blockIndex);
    // console.log(colorIndex)
    let block;
    switch (blockIndex) {
        case '1':
            block = new IBlock(colorIndex);
            break;
        case '2':
            block = new OBlock(colorIndex);
            break;
        case '3':
            block = new LBlock(colorIndex);
            break;
        case '4':
            block = new JBlock(colorIndex);
            break;
        case '5':
            block = new SBlock(colorIndex);
            break;
        case '6':
            block = new ZBlock(colorIndex);
            break;
        case '7':
            block = new TBlock(colorIndex);
            break;
    }
    return block;
}

// 绘制当前方块
function drawBlock() {
    nowBlock.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            // 0为空白，不绘制颜色
            if (value != 0) {
                // 颜色
                context.fillStyle = colors[nowBlock.color];
                // 方块样式：填充矩形
                context.fillRect(
                    // 左上角坐标
                    x + nowBlock.x + 0.1,
                    y + nowBlock.y + 0.1,
                    // 跨度
                    1 - 0.2,
                    1 - 0.2
                );

                // 白色边框
                context.strokeStyle = "#fff";
                context.lineWidth = 0.1;
                context.strokeRect(x + nowBlock.x, y + nowBlock.y, 1, 1);

                // 绘制条纹
                if (texture != 'solid') {
                    drawCrosshatch(x + nowBlock.x, y + nowBlock.y);
                }
            }
        })
    });
}

// 绘制下一个方块
function drawNextBlock() {
    nextBlock.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            // 0为空白，不绘制颜色
            if (value != 0) {
                // 颜色
                nextContext.fillStyle = colors[nextBlock.color]
                // 方块样式：填充矩形
                nextContext.fillRect(
                    // 左上角坐标
                    x + nextBlock.x + 0.1 + 1,
                    y + nextBlock.nexty + 0.1,
                    // 跨度
                    1 - 0.2,
                    1 - 0.2
                )
                // 白色边框
                nextContext.strokeStyle = "#fff"
                nextContext.lineWidth = 0.1
                nextContext.strokeRect(x + nextBlock.x + 1, y + nextBlock.nexty, 1, 1)

                // 绘制条纹
                if (texture != 'solid') {
                    drawNextCrosshatch(x + nextBlock.x + 1, y + nextBlock.nexty);
                }
            }
        })
    });
}

// 绘制游戏区固定的方块
function drawMatrix(arr) {
    arr.forEach((row, y) => {
        row.forEach((value, x) => {
            // 0为空白，不绘制颜色
            if (value != 0) {
                // 颜色
                context.fillStyle = colors[value];
                // 方块样式：填充矩形
                context.fillRect(
                    // 左上角坐标
                    x + 0.1,
                    y + 0.1,
                    // 跨度
                    1 - 0.2,
                    1 - 0.2
                );

                // 方块纹理
                if (texture != 'solid') {
                    drawCrosshatch(x, y);
                }
                // 白色边框
                context.strokeStyle = "#fff";
                context.lineWidth = 0.1;
                context.strokeRect(x, y, 1, 1);
            }
        })
    });
}

function drawCrosshatch(x, y) {
    context.strokeStyle = "#ffffff26";
    context.lineWidth = 0.1;

    if (texture === "stripes1") {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + 1, y + 1);
        context.stroke();

        context.beginPath();
        context.moveTo(x + 1, y);
        context.lineTo(x, y + 1);
        context.stroke();
    } else if (texture === "stripes2") {
        context.beginPath();
        context.moveTo(x + 1, y);
        context.lineTo(x, y + 1);
        context.stroke();
    } else if (texture === "stripes3") {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + 1, y + 1);
        context.stroke();
    }
}

function drawNextCrosshatch(x, y) {
    nextContext.strokeStyle = "#ffffff26";
    nextContext.lineWidth = 0.1;

    if (texture === "stripes1") {
        nextContext.beginPath();
        nextContext.moveTo(x, y);
        nextContext.lineTo(x + 1, y + 1);
        nextContext.stroke();

        nextContext.beginPath();
        nextContext.moveTo(x + 1, y);
        nextContext.lineTo(x, y + 1);
        nextContext.stroke();
    } else if (texture === "stripes2") {
        nextContext.beginPath();
        nextContext.moveTo(x + 1, y);
        nextContext.lineTo(x, y + 1);
        nextContext.stroke();
    } else if (texture === "stripes3") {
        nextContext.beginPath();
        nextContext.moveTo(x, y);
        nextContext.lineTo(x + 1, y + 1);
        nextContext.stroke();
    }
}


function resetCanvas() {
    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = "#000000";
    context.fillRect(0, 0, WIDTH, HEIGHT);
}


function resetNextCanvas() {
    nextContext.clearRect(0, 0, WIDTH, HEIGHT);
    nextContext.fillStyle = "#fff";
    nextContext.fillRect(0, 0, WIDTH, HEIGHT);
}

// 重新生成一个方块
function resetBlock() {
    if (!isOver()) {
        nowBlock = nextBlock;
        nextBlock = createBlock();
        drawNext();
    }
}


// 动画
function update(time = 0) {
    const deltaTime = time - lastTime;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        // 每秒下落一格
        blockDrop();
        dropCounter = 0;
    }
    lastTime = time; // 更新上一帧时间为当前时间
    draw();
    requestAnimationFrameId = requestAnimationFrame(update);
}

// 下落
function blockDrop() {
    if (nowBlock.state == 0) { // state = 0 表示方块还没有出现在游戏区 
        if (nowBlock.y >= 0) {
            nowBlock.state = 1; // state = 1 表示在游戏区中下落。完全出现在了游戏区
        } else {
            for (let i = 0; i < nowBlock.shape.length; i++) {
                for (let j = 0; j < nowBlock.shape[i].length; j++) {
                    if (
                        arena[nowBlock.y + i + 1] &&
                        arena[nowBlock.y + i + 1][nowBlock.x + j]
                    ) {
                        nowBlock.state = 1;// 判断再往下落一步的区域是否有已经固定的方块

                    }
                }
            }
        }
    }

    // state = 1 才会检测碰撞 和 下落
    // 出现在游戏区之后才需要检查
    if (nowBlock.state == 1) {
        const nextBlockPos = { ...nowBlock };
        nextBlockPos.y += 1;
        if (collide(arena, nextBlockPos)) {
            // 碰撞时合并
            merge(arena, nowBlock)
            // 同一行每一列都不为空
            // 得分，清空
            clearLine(arena)
            // 重新生成方块
            resetBlock()
        } else {
            nowBlock.y = nextBlockPos.y
        }
    } else {
        nowBlock.y += 1;
    }
}


// 判断方块与游戏区是否冲突
function collide(arena, block) {
    for (let i = 0; i < block.shape.length; i++) {
        for (let j = 0; j < block.shape[i].length; j++) {
            // block没有方块的点
            if (!block.shape[i][j]) continue;

            //block有方块的点不在arena中（超出去了）
            if (
                arena[block.y + i] === undefined ||
                arena[block.y + i][block.x + j] === undefined
            ) {
                return true
            }

            //block有方块的点跟在arena中的点碰撞
            if (
                arena[block.y + i] &&
                arena[block.y + i][block.x + j]
            ) {
                return true;
            }
        }
    }
    return false;
}

// 将方块固定
function merge(arena, block) {
    if (block.y + block.shape[0].length < 0) return;
    for (let i = 0; i < block.shape.length; i++) {
        for (let j = 0; j < block.shape[i].length; j++) {
            if (block.y + i >= 0 && block.shape[i][j] !== 0) {
                arena[block.y + i][block.x + j] = block.color;
            }
        }
    }
}

// 得分，消除一行
function clearLine(arena) {
    for (let i = 0; i < arena.length; i++) {
        for (let j = 0; j < arena[i].length; j++) {
            if (arena[i][j] === 0) break;
            if (j === arena[i].length - 1) {
                arena.unshift(arena.splice(i, 1)[0].fill(0));
                score += 10;
                updateScore();
            }
        }
    }
}

function updateScore() {
    scoreDom.innerHTML = score;
}

function isOver() {
    for (x of arena[0]) {
        if (x != 0) {
            let re = prompt("请输入您的昵称");
            if (re.trim() != '' && re != null) {
                // Json对象
                var player = {
                    "name": re,
                    "score": parseInt(scoreDom.textContent)
                };
                $.ajax({
                    url: 'http://localhost:8080/player',
                    type: 'post',
                    async: true,
                    contentType: "application/json;charset=UTF-8", //使用 application/json;charset=UTF-8
                    data: JSON.stringify(player), //将JSON对象转换为JSON字符串
                    dataType: 'json',
                    success: function (data) {

                    }
                });
            }
            if (requestAnimationFrameId) {
                cancelAnimationFrame(requestAnimationFrameId);
                requestAnimationFrameId = null;
            }
            console.log(requestAnimationFrameId)
            nowBlock.state = 2;
            nowBlock.shape = [];

            return true;
        }
    }
    return false;
}

function init() {
    arena = createMatrix(12, 20);
    score = 0;
    updateScore();

    // 方块下落速度
    // 可以是小数
    let n = parseFloat(speedDom.value);
    // n 是 NaN，速度就是默认的1秒下落1格
    if (n != n) {
        dropInterval = 1000;
    } else {
        dropInterval = 1000 / n;
    }

    // 方块类型
    blockType();

    nextBlock = createBlock();
    nowBlock = nextBlock;
    nextBlock = createBlock();
    draw();
    drawNext();
}

function blockType() {
    types.length = 0;
    // 被选中的多选框
    var checkedBox = document.querySelectorAll('input[name="block"]:checked');
    for (let x of checkedBox) {
        // 值为0 的话就是全选
        if (x.value == 0) {
            types = ['1', '2', '3', '4', '5', '6', '7'];
            break;
        }
        types.push(x.value);
    }
}


let tempTexture = "";
let tempcolors = [null];
// 方块纹理
//当下拉框的值改变时触发
textureDom.addEventListener("change", (e) => {
    tempTexture = textureDom.value;
});



// 颜色
colorDom.forEach(color => {
    color.addEventListener('input', () => {
        tempcolors = Array.from(colorDom, color => color.value);
        tempcolors.unshift(null);
    });
});



startDom.addEventListener("click", (e) => {
    // state = 2 的话方块就不会再下落
    if (nowBlock != null && nowBlock.state == 2) {
        requestAnimationFrameId = null;
    }
    // console.log(requestAnimationFrameId);
    if (requestAnimationFrameId) return;

    if (tempTexture != "") {
        texture = tempTexture;
    }
    if (tempcolors.length != 1) {
        colors = tempcolors;
    }
    initDraw();
    init();
    update();
    startDom.blur();
});

pauseDom.addEventListener("click", (e) => {
    if (!requestAnimationFrameId) {
        drawNext();
        update();
    } else {
        cancelAnimationFrame(requestAnimationFrameId);
        requestAnimationFrameId = null;
    }
    pauseDom.blur();

});

resetDom.addEventListener("click", (e) => {
    let re = confirm("是否确定重新开始游戏？");
    if (re == true) {
        if (tempTexture != "") {
            texture = tempTexture;
        }
        if (tempcolors.length != 1) {
            colors = tempcolors;
        }
        init();
        update();
    }
    resetDom.blur();

});

window.addEventListener("keydown", (e) => {
    if (e.code == "Space") {
        console.log("按下空格键")
        if (!requestAnimationFrameId) {
            drawNext();
            update();
        } else {
            cancelAnimationFrame(requestAnimationFrameId);
            requestAnimationFrameId = null;
        }
    }

    if (!requestAnimationFrameId) return;

    switch (e.key) {
        case "ArrowLeft":
        case "A":
        case "a": {
            nowBlock.moveleft();
            break;
        }
        case "ArrowRight":
        case "D":
        case "d": {
            nowBlock.moveright();
            break;
        }
        case "ArrowDown":
        case "S":
        case "s": {
            nowBlock.movedown();
            break;
        }
        case "ArrowUp":
        case "W":
        case "w": {
            nowBlock.rotate();
            break;
        }
    }
});

function closePopup() {
    document.getElementById("popup").style.visibility = 'hidden';
}

rankDom.addEventListener("click", (e) => {
    $.ajax({
        url: 'http://localhost:8080/player',
        method: 'get',
        success: function (res) {
            const listDom = document.getElementById('list');
            listDom.innerHTML = '';

            const headList = document.createElement('li');
            headList.innerHTML = `<span id="number">名次</span> <span  class="name" style="white-space: pre;">昵称</span><span>得分</span>`;
            listDom.appendChild(headList);

            const dataArray = Array.isArray(res.data) ? res.data : Object.values(res.data);
            let num = 0;
            dataArray.forEach(item => {
                num++;
                const listItem = document.createElement('li');
                listItem.innerHTML = `<span id="number">${num}</span> <span  class="name" style="white-space: pre;">${item.name}</span><span>${item.score}</span>`;
                listDom.appendChild(listItem);
            });
        },
    });
    document.getElementById("popup").style.visibility = 'visible';
});
