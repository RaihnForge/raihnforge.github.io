(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = document.getElementById('rain-bg');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var drops = { far: [], near: [] };
  var raf = null;
  var paused = false;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function spawnFar(w, h) {
    return { x: Math.random() * (w + 60), y: Math.random() * (h + 60) - 60, len: 7 + Math.random() * 9, speed: 0.5 + Math.random() * 0.8, alpha: 0.018 + Math.random() * 0.024 };
  }
  function spawnNear(w, h) {
    return { x: Math.random() * (w + 60), y: Math.random() * (h + 60) - 60, len: 14 + Math.random() * 18, speed: 1.1 + Math.random() * 1.2, alpha: 0.045 + Math.random() * 0.065 };
  }

  function init() {
    resize();
    var w = canvas.width, h = canvas.height;
    drops.far = [];
    drops.near = [];
    for (var i = 0; i < 70; i++) drops.far.push(spawnFar(w, h));
    for (var i = 0; i < 50; i++) drops.near.push(spawnNear(w, h));
  }

  function frame() {
    if (paused) return;
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var farMult  = isDark ? 1 : 0.25;
    var nearMult = isDark ? 1 : 0.20;

    ctx.lineWidth = 1;
    ctx.lineCap = 'round';

    for (var i = 0; i < drops.far.length; i++) {
      var d = drops.far[i];
      ctx.strokeStyle = 'rgba(160, 200, 240, ' + (d.alpha * farMult) + ')';
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 0.25 * d.len / 10, d.y + d.len);
      ctx.stroke();
      d.y += d.speed;
      if (d.y > h + 10) { var r = spawnFar(w, h); r.y = -r.len; d.x = r.x; d.y = r.y; d.len = r.len; d.speed = r.speed; d.alpha = r.alpha; }
    }

    for (var i = 0; i < drops.near.length; i++) {
      var d = drops.near[i];
      ctx.strokeStyle = 'rgba(180, 215, 248, ' + (d.alpha * nearMult) + ')';
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 0.3 * d.len / 12, d.y + d.len);
      ctx.stroke();
      d.y += d.speed;
      if (d.y > h + 10) { var r = spawnNear(w, h); r.y = -r.len; d.x = r.x; d.y = r.y; d.len = r.len; d.speed = r.speed; d.alpha = r.alpha; }
    }

    raf = requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', function () {
    paused = document.hidden;
    if (!paused && !raf) raf = requestAnimationFrame(frame);
  });

  window.addEventListener('resize', function () {
    resize();
    init();
  });

  init();
  raf = requestAnimationFrame(frame);
})();
