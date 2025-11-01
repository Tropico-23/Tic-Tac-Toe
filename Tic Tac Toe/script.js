// JavaScript game logic with Minimax for unbeatable bot
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const swapBtn = document.getElementById('swap');
const playerMarkEl = document.getElementById('playerMark');
const botMarkEl = document.getElementById('botMark');
const scorePlayerEl = document.getElementById('score-player');
const scoreBotEl = document.getElementById('score-bot');
const scoreDrawEl = document.getElementById('score-draw');
const difficultySelect = document.getElementById('difficulty');

let board = Array(9).fill(null); // 0..8
let player = 'X';
let bot = 'O';
let turn = 'player';
let scores = {player:0, bot:0, draw:0};

const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

function init(){
    boardEl.innerHTML = '';
    for(let i=0;i<9;i++){
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.setAttribute('role','button');
    cell.innerHTML = '<span></span>';
    cell.addEventListener('click', onCellClick);
    boardEl.appendChild(cell);
    }
    updateMarks();
    statusEl.textContent = (turn === 'player') ? 'Make your move — you go first.' : 'Bot is thinking...';
    if(turn === 'bot') setTimeout(botMove,250);
}

function updateMarks(){
    playerMarkEl.textContent = player;
    botMarkEl.textContent = bot;
}

function onCellClick(e){
    const idx = parseInt(e.currentTarget.dataset.index,10);
    if(board[idx] || checkWinner(board) || turn !== 'player') return;
    makeMove(idx, player);
    render();
    const result = checkWinner(board);
    if(result) return endRound(result);
    turn = 'bot';
    statusEl.textContent = 'Bot is thinking...';
    setTimeout(botMove, 350);
}

function makeMove(i, mark){
    board[i]=mark;
}

function render(){
    document.querySelectorAll('.cell').forEach(c=>{
    const i = parseInt(c.dataset.index,10);
    c.classList.toggle('disabled', !!board[i] || checkWinner(board));
    const span = c.querySelector('span');
    span.style.opacity = board[i] ? '1' : '0';
    span.style.transform = board[i] ? 'translateY(0)' : 'translateY(6px)';
    span.textContent = board[i] || '';
    if(board[i] === player){
        span.style.fontSize = '44px';
        span.style.color = '#fff';
        span.style.filter = 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))';
    } else if(board[i] === bot){
        span.style.fontSize = '44px';
        span.style.color = '#fff';
        span.style.filter = 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))';
    }
    });
}

function checkWinner(bd){
    for(const line of wins){
    const [a,b,c] = line;
    if(bd[a] && bd[a] === bd[b] && bd[a] === bd[c]){
        return {winner:bd[a], line};
    }
    }
    if(bd.every(Boolean)) return {winner: 'draw'};
    return null;
}

function endRound(result){
    if(result.winner === 'draw'){
    statusEl.textContent = 'It\'s a draw.';
    scores.draw++;
    scoreDrawEl.textContent = scores.draw;
    } else if(result.winner === player){
    statusEl.textContent = 'You win! Nice play.';
    scores.player++;
    scorePlayerEl.textContent = scores.player;
    animateWin(result.line, 'player');
    } else {
    statusEl.textContent = 'Bot wins — better luck next time.';
    scores.bot++;
    scoreBotEl.textContent = scores.bot;
    animateWin(result.line, 'bot');
    }
    render();
    // disable board
}

function animateWin(line, who){
    // simple highlight
    for(let i of line){
    const cell = document.querySelector(`.cell[data-index='${i}']`);
    cell.style.transition = 'transform .18s, box-shadow .18s, background .2s';
    cell.style.transform = 'scale(1.06)';
    cell.style.boxShadow = '0 18px 40px rgba(2,6,23,0.6)';
    cell.style.background = who==='player' ? 'linear-gradient(180deg, rgba(45,212,191,0.12), rgba(45,212,191,0.06))' : 'linear-gradient(180deg, rgba(251,113,133,0.12), rgba(251,113,133,0.06))';
    }
}

function botMove(){
    if(checkWinner(board)) return;
    const difficulty = difficultySelect.value;
    let idx;
    if(difficulty === 'easy'){
    // random available
    const avail = board.map((v,i)=>v?null:i).filter(v=>v!==null);
    idx = avail[Math.floor(Math.random()*avail.length)];
    } else {
    idx = bestMove(board, bot);
    }
    makeMove(idx, bot);
    render();
    const result = checkWinner(board);
    if(result) return endRound(result);
    turn = 'player';
    statusEl.textContent = 'Your turn.';
}

// Minimax algorithm
function bestMove(bd, mark){
    // If board empty try best opening (corner or center)
    if(bd.every(v => v===null)){
    return 4; // center
    }

    const opponent = (mark === 'X') ? 'O' : 'X';
    let bestScore = -Infinity;
    let move = null;

    for(let i=0;i<9;i++){
    if(bd[i] === null){
        bd[i] = mark;
        const score = minimax(bd, 0, false, mark, opponent);
        bd[i] = null;
        if(score > bestScore){ bestScore = score; move = i; }
    }
    }
    return move;
}

function minimax(bd, depth, isMaximizing, playerMark, opponentMark){
    const res = checkWinner(bd);
    if(res){
    if(res.winner === 'draw') return 0;
    if(res.winner === playerMark) return 10 - depth;
    if(res.winner === opponentMark) return depth - 10;
    }

    if(isMaximizing){
    let best = -Infinity;
    for(let i=0;i<9;i++){
        if(bd[i]===null){
        bd[i] = playerMark;
        const score = minimax(bd, depth+1, false, playerMark, opponentMark);
        bd[i] = null;
        best = Math.max(best, score);
        }
    }
    return best;
    } else {
    let best = Infinity;
    for(let i=0;i<9;i++){
        if(bd[i]===null){
        bd[i] = opponentMark;
        const score = minimax(bd, depth+1, true, playerMark, opponentMark);
        bd[i] = null;
        best = Math.min(best, score);
        }
    }
    return best;
    }
}

// Controls
resetBtn.addEventListener('click', ()=>{
    board = Array(9).fill(null);
    turn = 'player';
    statusEl.textContent = 'Make your move — you go first.';
    document.querySelectorAll('.cell').forEach(c=>{c.style.background='';c.style.transform='';c.style.boxShadow='';});
    render();
});

swapBtn.addEventListener('click', ()=>{
    // swap marks and optionally let bot start
    [player, bot] = [bot, player];
    updateMarks();
    board = Array(9).fill(null);
    document.querySelectorAll('.cell').forEach(c=>{c.style.background='';c.style.transform='';c.style.boxShadow='';});
    // if player is 'O', bot starts
    turn = (player === 'O') ? 'bot' : 'player';
    statusEl.textContent = turn === 'bot' ? 'Bot starts...' : 'You start — good luck!';
    render();
    if(turn === 'bot') setTimeout(botMove, 500);
});

// init scores & board
scorePlayerEl.textContent = scores.player;
scoreBotEl.textContent = scores.bot;
scoreDrawEl.textContent = scores.draw;

// create initial board and render
init();

// keyboard accessibility: 1-9 map
window.addEventListener('keydown', (e)=>{
    if(e.key >= '1' && e.key <= '9'){
    const idx = parseInt(e.key,10)-1;
    // if board visible and player's turn
    if(turn==='player' && !board[idx]){
        makeMove(idx, player);
        render();
        const result = checkWinner(board);
        if(result) return endRound(result);
        turn='bot'; statusEl.textContent='Bot is thinking...'; setTimeout(botMove,300);
    }
    }
});