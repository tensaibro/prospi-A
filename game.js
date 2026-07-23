const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let ball = null;
let swing = false;
let resultText = "";
let pitchTypes = ["fastball", "curve", "slider", "fork"];
let strikeZone = { x: 250, y: 150, w: 200, h: 200 };

function pitchBall() {
  const type = pitchTypes[Math.floor(Math.random() * pitchTypes.length)];

  let speed;
  let drop = 0;
  let curve = 0;

  if (type === "fastball") speed = 7;
  if (type === "slider") { speed = 6; curve = 0.2; }
  if (type === "curve") { speed = 5; drop = 0.3; }
  if (type === "fork") { speed = 4; drop = 0.6; }

  ball = {
    x: 350,
    y: 50,
    vx: curve,
    vy: speed,
    drop: drop,
    hit: false,
    type: type
  };

  resultText = "";
}

function swingBat() {
  swing = true;

  if (!ball) return;

  // Check timing
  if (ball.y > 300 && ball.y < 360) {
    // Check horizontal alignment
    if (ball.x > 300 && ball.x < 400) {
      ball.hit = true;

      // Hit power
      ball.vy = -10;
      ball.vx = (Math.random() * 4) - 2;

      resultText = "HIT!";
    } else {
      resultText = "MISS (bad aim)";
    }
  } else {
    resultText = "MISS (bad timing)";
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === " ") swingBat();
  if (e.key === "p") pitchBall();
});

function update() {
  if (ball) {
    if (!ball.hit) {
      ball.vy += ball.drop;
    }

    ball.x += ball.vx;
    ball.y += ball.vy;

    // Strike zone check
    if (!ball.hit && ball.y > strikeZone.y + strikeZone.h) {
      resultText = "Strike!";
      ball = null;
    }

    // Ball out of screen
    if (ball.y < -20 || ball.y > canvas.height + 20) {
      ball = null;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Strike zone
  ctx.strokeStyle = "white";
  ctx.strokeRect(strikeZone.x, strikeZone.y, strikeZone.w, strikeZone.h);

  // Ball
  if (ball) {
    ctx.fillStyle = ball.hit ? "yellow" : "white";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "gray";
    ctx.fillText(ball.type.toUpperCase(), 10, 20);
  }

  // Result text
  ctx.fillStyle = "white";
  ctx.font = "30px monospace";
  ctx.fillText(resultText, 10, 480);

  // Bat (simple line)
  if (swing) {
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(300, 350);
    ctx.lineTo(450, 330);
    ctx.stroke();
    swing = false;
  }

  requestAnimationFrame(draw);
}

draw();

