const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// ストライクゾーン
const zone = { x: 350, y: 120, w: 200, h: 260 };

// ミートカーソル
let cursor = { x: 450, y: 250, r: 25 };

// 選手能力（プロスピ風）
const batter = { meet: 75, power: 85 };
const pitcher = { control: 70, velocity: 150, break: 60 };

// 球種
const pitchTypes = {
  1: { name: "ストレート", speed: 7, drop: 0, curve: 0 },
  2: { name: "スライダー", speed: 6, drop: 0, curve: 0.25 },
  3: { name: "カーブ", speed: 5, drop: 0.35, curve: 0.1 },
  4: { name: "フォーク", speed: 4, drop: 0.7, curve: 0 }
};

let selectedPitch = 1;
let pitchTarget = { x: 450, y: 250 };

let ball = null;
let resultText = "";

// 試合状態
let inning = 1;
let topBottom = "表";
let outs = 0;
let bases = [false, false, false]; // 1,2,3塁
let score = 0;

// 投球開始
function pitchBall() {
  const p = pitchTypes[selectedPitch];

  ball = {
    x: 450,
    y: 80,
    vx: (pitchTarget.x - 450) / 120,
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

  const timing = Math.abs(ball.y - cursor.y);

  if (timing < 40) {
    const dx = ball.x - cursor.x;
    const dy = ball.y - cursor.y;
    const dist = Math.hypot(dx, dy);

    if (dist < cursor.r) {
      ball.hit = true;

      const power = batter.power / 100;
      const angle = (cursor.x - 450) * 0.02;

      ball.vy = -10 - power * 5;
      ball.vx = angle * 5;

      resultText = "ヒット！";
      advanceRunners();

      if (power > 0.8 && Math.random() < 0.4) {
        resultText = "ホームラン！！";
        score++;
        bases = [false, false, false];
      }

    } else {
      resultText = "空振り";
      outs++;
    }
  } else {
    resultText = "タイミング×";
    outs++;
  }

  checkInning();
}

document.addEventListener("keydown", e => {
  if (e.key === " ") swing();
  if (e.key === "p") pitchBall();
  if (["1","2","3","4"].includes(e.key)) selectedPitch = Number(e.key);
});

// 走塁処理
function advanceRunners() {
  if (bases[2]) score++;
  bases[2] = bases[1];
  bases[1] = bases[0];
  bases[0] = true;
}

// イニング進行
function checkInning() {
  if (outs >= 3) {
    outs = 0;
    bases = [false, false, false];

    if (topBottom === "表") {
      topBottom = "裏";
    } else {
      inning++;
      topBottom = "表";
    }
  }
}

// メイン更新
function update() {
  // ミートカーソル移動
  if (keys["ArrowUp"]) cursor.y -= 3;
  if (keys["ArrowDown"]) cursor.y += 3;
  if (keys["ArrowLeft"]) cursor.x -= 3;
  if (keys["ArrowRight"]) cursor.x += 3;

  // コース選択（投手）
  if (keys["w"]) pitchTarget.y -= 3;
  if (keys["s"]) pitchTarget.y += 3;
  if (keys["a"]) pitchTarget.x -= 3;
  if (keys["d"]) pitchTarget.x += 3;

  // 投球中
  if (ball) {
    if (!ball.hit) {
      ball.vy += ball.drop;
      ball.vx += ball.curve;
    }

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (!ball.hit && ball.y > zone.y + zone.h) {
      resultText = "ストライク";
      outs++;
      ball = null;
      checkInning();
    }

    if (!ball.hit && (ball.x < zone.x || ball.x > zone.x + zone.w)) {
      if (ball.y > zone.y + zone.h) {
        resultText = "ボール";
        ball = null;
      }
    }

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

  // コースターゲット
  ctx.fillStyle = "cyan";
  ctx.fillRect(pitchTarget.x - 5, pitchTarget.y - 5, 10, 10);

  // ボール
  if (ball) {
    ctx.fillStyle = ball.hit ? "orange" : "white";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // UI
  ctx.fillStyle = "white";
  ctx.font = "20px monospace";
  ctx.fillText(`球種: ${pitchTypes[selectedPitch].name}`, 10, 30);
  ctx.fillText(`結果: ${resultText}`, 10, 60);
  ctx.fillText(`イニング: ${inning}回${topBottom}`, 10, 90);
  ctx.fillText(`アウト: ${outs}`, 10, 120);
  ctx.fillText(`ランナー: ${bases.map(b => b ? "●" : "○").join(" ")}`, 10, 150);
  ctx.fillText(`得点: ${score}`, 10, 180);

  requestAnimationFrame(draw);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
