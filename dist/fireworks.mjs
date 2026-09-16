const PALETTE = ['#ffe58b', '#7cefff', '#ff9edf', '#d2f86a', '#bb9cff', '#ffbd85'];

export class Fireworks {
  constructor(random = Math.random) { this.random = random; this.reset(); }
  reset() { this.elapsed = 0; this.rockets = []; this.sparks = []; }
  start() {
    this.reset();
    this.rockets = [[70,170],[224,272],[148,83],[56,335],[235,145],[150,245]].map(([x,y],i) => ({
      x, y, startX: x + (this.random() - .5) * 55, at: i * 330, flight: 450, color: PALETTE[i], exploded: false
    }));
  }
  update(dt) {
    this.elapsed += dt;
    const seconds = dt / 1000, drag = Math.pow(.985, dt / 16);
    for (const spark of this.sparks) {
      spark.life -= dt; spark.x += spark.vx * seconds; spark.y += spark.vy * seconds;
      spark.vx *= drag; spark.vy = spark.vy * drag + 65 * seconds;
    }
    this.sparks = this.sparks.filter(spark => spark.life > 0);
    for (const rocket of this.rockets) {
      if (rocket.exploded || this.elapsed < rocket.at + rocket.flight) continue;
      rocket.exploded = true;
      for (let i = 0; i < 44; i++) {
        const angle = i / 44 * Math.PI * 2 + this.random() * .08;
        const speed = 65 + this.random() * 100, life = 850 + this.random() * 550;
        this.sparks.push({ x: rocket.x, y: rocket.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          life, max: life, color: i % 5 === 0 ? '#fff8d6' : rocket.color, size: 1 + this.random() * 1.3 });
      }
    }
  }
  draw(context) {
    context.save(); context.globalCompositeOperation = 'lighter'; context.lineCap = 'round';
    for (const rocket of this.rockets) {
      if (rocket.exploded || this.elapsed < rocket.at) continue;
      const t = Math.min(1, (this.elapsed - rocket.at) / rocket.flight), tail = Math.max(0, t - .13);
      const point = progress => ({ x: rocket.startX + (rocket.x - rocket.startX) * progress, y: 590 + (rocket.y - 590) * (1 - Math.pow(1 - progress, 1.3)) });
      const head = point(t), end = point(tail);
      context.strokeStyle = rocket.color; context.shadowColor = rocket.color; context.shadowBlur = 9; context.lineWidth = 2;
      context.beginPath(); context.moveTo(end.x, end.y); context.lineTo(head.x, head.y); context.stroke();
    }
    for (const spark of this.sparks) {
      context.globalAlpha = Math.min(1, spark.life / 450);
      context.strokeStyle = spark.color; context.shadowColor = spark.color; context.shadowBlur = 6; context.lineWidth = spark.size;
      context.beginPath(); context.moveTo(spark.x - spark.vx * .035, spark.y - spark.vy * .035); context.lineTo(spark.x, spark.y); context.stroke();
    }
    context.restore();
  }
}
