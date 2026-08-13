/**
 * speech_bubble.js - Overhead Canvas Speech Bubble Renderer
 */

window.SpeechBubbleRenderer = {
  render(ctx, text, headY) {
    if (!text) return;

    ctx.font = 'bold 11px "Zen Maru Gothic", sans-serif';
    let textWidth = ctx.measureText(text).width;
    let bWidth = Math.max(60, textWidth + 18);
    let bHeight = 22;
    let bX = -bWidth / 2;
    let bY = headY - 32;

    // Glassy Bubble Background with Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(bX, bY, bWidth, bHeight, 10);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Triangle Pointer
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-4, bY + bHeight);
    ctx.lineTo(0, bY + bHeight + 5);
    ctx.lineTo(4, bY + bHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Text Label
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, bY + bHeight / 2);
  }
};
