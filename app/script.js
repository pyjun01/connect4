(() => {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  const color = {
    board: "#0af",
    red: "#e52f50",
    yellow: "#fce403",
    background: "#fff"
  };

  /* size info */
  const row = 7; // row count
  const column = 6; // column count
  const gap = 15; // between hole
  const padding = 10; // edge of board
  const radius = 30; // hole radius
  const boardWidth = padding * 2 + radius * row * 2 + gap * (row - 1);
  const boardHeight = padding * 2 + radius * column * 2 + gap * (column - 1);
  const ballSpace = 80; // space above the board
  const width = boardWidth; // canvas width
  const height = boardHeight + ballSpace; // canvas height
  /* //size info */

  const balls = new Array(7).fill(null).map(() => new Array(6).fill(null));

  let turn = "red"; // red | yellow
  let y = ballSpace / 2; // initial position
  let clicked = false; // click flag
  let idx = 0; // current mouse position based column index

  const FPS = 1000 / 70;
  let time = 0;

  const position = {
    getX(x) {
      return padding + radius + x * (radius * 2 + gap);
    },
    getY(y) {
      return ballSpace + this.getX(y);
    },
    getPos(x, y) {
      return [this.getX(x), this.getY(y)];
    }
  }

  const renderBoard = () => {
    ctx.clearRect(0, 0, boardWidth, boardHeight);
  
    ctx.save();
  
    ctx.fillStyle = color.board;
  
    ctx.fillRect(0, ballSpace, boardWidth, boardHeight);
  
    ctx.fillStyle = color.background;
  
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 6; j++) {
        const [x, y] = position.getPos(i, j);

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      }
    }
  
    ctx.restore();
  };

  const renderGap = () => {
    ctx.save();
  
    ctx.fillStyle = color.board;
  
    ctx.beginPath();
    ctx.moveTo(padding, position.getY(0));
    for (let i = 0; i < 7; i++) {
      ctx.arc(position.getX(i), position.getY(0), radius, Math.PI, 0);
    }
    ctx.lineTo(boardWidth - padding, ballSpace);
    ctx.lineTo(padding, ballSpace);
    ctx.fill();
    ctx.closePath();
  
    for (let k = 0; k < 5; k++) {
      ctx.beginPath();
      ctx.moveTo(boardWidth - padding, position.getY(k));
  
      for (let i = 6; i >= 0; i--) {
        const [x, y] = position.getPos(i, k);

        ctx.arc(x, y, radius, 0, Math.PI);
      }
      for (let i = 0; i < 7; i++) {
        const [x, y] = position.getPos(i, k + 1);

        ctx.arc(x, y, radius, Math.PI, 0);
      }
  
      ctx.fill();
      ctx.closePath();
    }

    ctx.restore();
  };
  
  const renderBalls = () => {
    ctx.save();
    balls.flat().forEach((user, idx) => {
      if (user === null) {
        return;
      }

      const [x, y] = position.getPos(Math.floor(idx / 6), 5 - (idx % 6));

      ctx.beginPath();

      ctx.arc(x, y, radius, 0, Math.PI * 2);

      ctx.fillStyle = color[user];

      ctx.fill();
      ctx.closePath();
    });
    ctx.restore();
  };

  const renderCurrentBall = () => {
    ctx.save();
    
    ctx.fillStyle = color[turn];

    ctx.beginPath();
  
    ctx.arc(
      position.getX(idx),
      y,
      radius,
      0,
      Math.PI * 2
    );
  
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  };

  const renderBallSpace = () => {
    ctx.clearRect(0, 0, width, ballSpace);

    renderCurrentBall();
  };

  const renderEntireObject = () => {
    renderBoard();
    renderCurrentBall();
    renderGap();
    renderBalls();
  }

  const render = (timestamp) => {
    if (timestamp > time + FPS) {
      time = timestamp;

      const prevY = y;

      renderEntireObject();

      updateBallPosition();

      if (prevY === y) { // end animation
        balls[idx][balls[idx].indexOf(null)] = turn;

        if (checkWin(turn)) {
          setTimeout(() => alert(`${turn} win!`), 0);
          return;
        }

        clicked = false;
        y = ballSpace / 2;
        turn = turn === "red" ? "yellow" : "red";

        renderBalls();
        renderCurrentBall();

        return;
      }
    }
  
    window.requestAnimationFrame(render);
  };

  const updateBallPosition = () => {
    const target = position.getY(5 - balls[idx].indexOf(null)); // target Y position

    y = Math.min(y + 8, target);
  };

  const rowSequences = Array.from({ length: 6 }, (v, i) => [3, i, [1, i, [2, i, [0, i], [4, i]]], [5, i, [4, i, [6, i], [2, i]]]]);
  const columnSequences = Array.from({ length: 7 }, (v, i) => [i, 2, [i, 3, [i, 1, [i, 0], [i, 4]], [i, 4, [i, 5, i, 1]]]]);
  const sequenceList = [
    rowSequences,
    columnSequences,

    [6, 3, [5, 2, [4, 1, [3, 0]]]],
    [0, 3, [1, 2, [2, 1, [3, 0]]]],
    [3, 5, [4, 4, [5, 3, [6, 2]]]],
    [3, 5, [2, 4, [1, 3, [0, 2]]]],

    [2, 2, [3, 1, [1, 3, [4, 0], [0, 4]]]],
    [4, 3, [5, 2, [3, 4, [6, 1], [2, 5]]]],
    [4, 2, [3, 1, [5, 3, [2, 0], [6, 4]]]],
    [2, 3, [1, 2, [3, 4, [0, 1], [4, 5]]]],

    [2, 2, [3, 3, [1, 1, [0, 0], [4, 4]], [4, 4, [5, 5], [1, 1]]]],
    [3, 2, [4, 3, [2, 1, [1, 0], [5, 4]], [5, 4, [6, 5], [2, 1]]]],
    [3, 2, [2, 3, [4, 1, [5, 0], [1, 4]], [1, 4, [0, 5], [4, 1]]]],
    [4, 2, [3, 3, [5, 1, [6, 0], [2, 4]], [2, 4, [1, 5], [5, 1]]]],
  ];

  const checker = (arr) => {
    if (typeof arr[0] === 'number' && typeof arr[1] === 'number') {
      const [x, y, ...next] = arr;

      if (balls[x][y] === turn) {
        if (next.length === 0) {
          return true;
        }

        return checker(...(next.length === 1 ? next : [next]));
      }

      return false;
    }

    return arr.some(checker);
  }

  const checkWin = () => checker(sequenceList);

  const initializeApp = () => {
    const getIdxFromMouseEvent = (e) => {
      const x = e.pageX - canvas.getBoundingClientRect().x;

      return Math.max(0, Math.min(6, Math.floor((x - padding) / (radius * 2 + gap))));
    };

    canvas.width = width;
    canvas.height = height;

    renderEntireObject();

    canvas.addEventListener('mousemove', (e) => {
      if (clicked) {
        return;
      }

      idx = getIdxFromMouseEvent(e);

      renderBallSpace();
    });

    canvas.addEventListener('click', (e) => {
      if (clicked) {
        return;
      }

      idx = getIdxFromMouseEvent(e);

      if (!balls[idx].includes(null)) {
        return;
      }

      clicked = true;

      render();
    });

  };

  initializeApp();
})();
