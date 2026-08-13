/**
 * speech_bubble.js - Non-Overlapping Speech Bubble System with Vertical Stacking Offset
 */

window.SpeechBubbleRenderer = {
  activeBubbles: [],

  resetFrame() {
    this.activeBubbles = [];
  },

  render(ctx, resident, tickCount) {
    if (!resident.speechText || resident.speechTimer <= 0) return;

    let rx = resident.x;
    let ry = resident.y - 48; // Base position above resident head

    // Calculate Vertical Stacking Offset to PREVENT BUBBLES FROM OVERLAPPING
    let stackOffset = 0;
    for (let b of this.activeBubbles) {
      let dx = Math.abs(b.x - rx);
      let dy = Math.abs(b.y - ry);
      if (dx < 120 && dy < 40) {
        stackOffset += 36; // Stack bubble higher
      }
    }

    ry -= stackOffset;
    this.activeBubbles.push({ x: rx, y: ry, residentId: resident.id });

    // Draw Rounded Bubble Box
    ctx.font = 'bold 12px "Zen Maru Gothic", sans-serif';
    let textWidth = ctx.measureText(resident.speechText).width;
    let paddingX = 14;
    let paddingY = 8;
    let bw = textWidth + paddingX * 2;
    let bh = 28;
    let bx = rx - bw / 2;
    let by = ry - bh;

    // Pulse animation
    let scale = 1.0 + Math.sin(tickCount * 0.1) * 0.02;

    ctx.save();
    ctx.translate(rx, ry - bh / 2);
    ctx.scale(scale, scale);
    ctx.translate(-rx, -(ry - bh / 2));

    // Bubble Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.roundRect(bx + 2, by + 3, bw, bh, 12);
    ctx.fill();

    // Bubble Background
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 12);
    ctx.fill();

    // Bubble Border
    ctx.strokeStyle = resident.bodyColor || '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pointer Triangle Tail
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(rx - 6, by + bh - 1);
    ctx.lineTo(rx, by + bh + 7);
    ctx.lineTo(rx + 6, by + bh - 1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = resident.bodyColor || '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text Content
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(resident.speechText, rx, by + bh / 2);

    ctx.restore();
  }
};
