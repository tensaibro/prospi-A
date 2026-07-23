const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// ストライクゾーン
const zone = { x: 300, y: 120, w: 200, h: 260 };

// ミートカーソル
let cursor = { x: 400, y: 250, r: 25 };

// 選手能力（プロスピ風）
const batter = {
  meet: 75,
  power: 85
};

const pitcher = {
  control: 70,
  velocity: 150,
  break: 60
};

// 球種
const pitchTypes = {
  straight: { speed: 7, drop: 0, curve: 0 },
  slider: { speed: 6, drop: 0, curve: 0.25 },
  curve: { speed: 5, drop: 0.35, curve: 0.1 },
  fork: { speed: 4, drop: 0.7, curve: 0 }
};

let selectedPitch = "straight";
let pitchTarget = { x: 400, y: 250 };

let ball = null;
let resultText = "";

// 投球開始
function pitchBall() {
  const p = pitchTypes[selectedPitch];

  ball = {
    x: 400,
    y: 80,
    vx: (pitchTarget.x - 400) / 120,
    vy: p.speed,
    drop: p.drop,
    curve: p.curve,
    hit: false
  };

  resultText = "";
}

// 打撃処理
function swing() {
  if (!ball) return;

  // タイミング判定
  const timing = Math.abs(ball.y - cursor.y);

  if (timing < 40) {
    // ミートカーソル判定
    const dx = ball.x - cursor.x;
    const dy = ball.y - cursor.y;
    const dist = Math.hypot(dx, dy);

    if (dist < cursor.r) {
      ball.hit = true;

      // 飛距離計算（プロスピ風）
      const power = batter.power / 100;
      const angle = (cursor.x - 400) * 0.02;

      ball.vy = -10 - power * 5;
      ball.vx = angle * 5;

      resultText = "ヒット！";

      if (power > 0.8 && Math.random() < 0.4) {
        resultText = "ホームラン！！";
      }

    } else {
      resultText = "空振り";
    }
  } else {
    resultText = "タイミング×";
  }
}

document.addEventListener("keydown", e => {
  if (e.key === " ") swing();
  if (e.key === "p") pitchBall();
});

// メイン更新
function update() {
  // ミートカーソル移動
  if (keys["ArrowUp"]) cursor.y -= 3;
  if (keys["ArrowDown"]) cursor.y += 3;
  if (keys["ArrowLeft"]) cursor.x -= 3;
  if (keys["ArrowRight"]) cursor.x += 3;

  // 投球中
  if (ball) {
    if (!ball.hit) {
      ball.vy += ball.drop;
      ball.vx += ball.curve;
    }

    ball.x += ball.vx;
    ball.y += ball.vy;

    // ストライク判定
    if (!ball.hit && ball.y > zone.y + zone.h) {
      resultText = "ストライク";
      ball = null;
    }

    // ボール判定
    if (!ball.hit && (ball.x < zone.x || ball.x > zone.x + zone.w)) {
      if (ball.y > zone.y + zone.h) {
        resultText = "ボール";
        ball = null;
      }
    }

    // 画面外
    if (ball.y < -20 || ball.y > canvas.height + 20) {
      ball = null;
    }
  }
}

// 描画
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ストライクゾーン
  ctx.strokeStyle = "white";
  ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);

  // ミートカーソル
  ctx.strokeStyle = "yellow";
  ctx.beginPath();
  ctx.arc(cursor.x, cursor.y, cursor.r, 0, Math.PI * 2);
  ctx.stroke();

  // ボール
  if (ball) {
    ctx.fillStyle = ball.hit ? "orange" : "white";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // 結果表示
  ctx.fillStyle = "white";
  ctx.font = "30px monospace";
  ctx.fillText(resultText, 10, 480);

  requestAnimationFrame(draw);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
