import React, { useRef, useEffect, useState } from "react";

const COLS = 20, ROWS = 20, SIZE = 20;

function getRandomFood(snake) {
  while (true) {
    const food = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
    if (!snake.some(seg => seg.x === food.x && seg.y === food.y)) return food;
  }
}

function App() {
  const canvasRef = useRef();
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState({ x: 0, y: -1 });
  const [food, setFood] = useState(getRandomFood([{ x: 10, y: 10 }]));
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(true);

  // We'll use a ref to store the next direction to avoid React state lag
  const nextDirRef = useRef({ x: 0, y: -1 });

  // Drawing the canvas
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, COLS * SIZE, ROWS * SIZE);

    // Food
    ctx.fillStyle = "#e63946";
    ctx.fillRect(food.x * SIZE, food.y * SIZE, SIZE, SIZE);

    // Snake
    ctx.fillStyle = "#00c853";
    snake.forEach(seg =>
      ctx.fillRect(seg.x * SIZE, seg.y * SIZE, SIZE, SIZE)
    );

    // Head border
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(snake[0].x * SIZE, snake[0].y * SIZE, SIZE, SIZE);

    // Game Over
    if (!running) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Game Over!", COLS * SIZE / 2, ROWS * SIZE / 2);
      ctx.font = "20px sans-serif";
      ctx.fillText("Score: " + score, COLS * SIZE / 2, ROWS * SIZE / 2 + 30);
      ctx.fillText("Press Restart or any Arrow Key", COLS * SIZE / 2, ROWS * SIZE / 2 + 60);
    }
  }, [snake, food, running, score]);

  // Game Loop
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      const nextDir = nextDirRef.current;
      const newHead = {
        x: snake[0].x + nextDir.x,
        y: snake[0].y + nextDir.y,
      };

      // Collision
      if (
        newHead.x < 0 || newHead.x >= COLS ||
        newHead.y < 0 || newHead.y >= ROWS ||
        snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)
      ) {
        setRunning(false);
        return;
      }

      // Eat food
      let ate = newHead.x === food.x && newHead.y === food.y;
      let newSnake = [newHead, ...snake];
      if (!ate) newSnake.pop();

      setSnake(newSnake);
      if (ate) {
        setFood(getRandomFood(newSnake));
        setScore(score + 1);
      }
      setDirection(nextDir);
    }, 100);

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [running, snake, food, score]);

  // Keyboard control (global event listener)
  useEffect(() => {
    function handle(e) {
      if (!running && ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
        resetGame();
        return;
      }
      if (!running) return;

      const dir = nextDirRef.current;
      if (e.key === "ArrowUp" && dir.y !== 1)    nextDirRef.current = { x: 0, y: -1 };
      if (e.key === "ArrowDown" && dir.y !== -1) nextDirRef.current = { x: 0, y: 1 };
      if (e.key === "ArrowLeft" && dir.x !== 1)  nextDirRef.current = { x: -1, y: 0 };
      if (e.key === "ArrowRight" && dir.x !== -1)nextDirRef.current = { x: 1, y: 0 };
    }
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [running]);

  function resetGame() {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 0, y: -1 });
    nextDirRef.current = { x: 0, y: -1 };
    setFood(getRandomFood([{ x: 10, y: 10 }]));
    setScore(0);
    setRunning(true);
  }

  return (
    <div style={{ textAlign: "center", background: "#181818", minHeight: "100vh", color: "#eee" }}>
      <h1>🐍 Snake Game (React)</h1>
      <div style={{ fontSize: "1.5em", margin: 16 }}>Score: {score}</div>
      <canvas
        ref={canvasRef}
        width={COLS * SIZE}
        height={ROWS * SIZE}
        tabIndex="1"
        style={{
          background: "#222",
          display: "block",
          margin: "0 auto",
          borderRadius: 8,
        }}
      />
      <br />
      <button style={{ padding: "8px 16px", fontSize: "1em" }} onClick={resetGame}>
        Restart
      </button>
      <div style={{margin:"1em", color:"#bbb"}}>Use Arrow Keys to Move</div>
    </div>
  );
}

export default App;
