/**
 * resident_render.js - Vector Canvas Resident Sprite, Grab/Carry Animation & Facial Expressions
 */

window.ResidentRenderer = {
  render(ctx, resident, tickCount) {
    ctx.save();

    let rx = resident.x;
    let ry = resident.y;
    let liftOffset = resident.isBeingCarried ? -20 : 0; // Lift in air when grabbed!

    ctx.translate(rx, ry + liftOffset);

    if (resident.inBed) {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(-10, -10, 20, 20, 4); ctx.fill();
      ctx.strokeStyle = '#000000'; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = '#000000'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-6, -4); ctx.lineTo(-2, -4); ctx.moveTo(2, -4); ctx.lineTo(6, -4); ctx.stroke();
      window.SpeechBubbleRenderer.render(ctx, resident, tickCount);
      ctx.restore();
      return;
    }

    // Shadow (Expands/fades when lifted in air)
    ctx.fillStyle = resident.isBeingCarried ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.22)';
    let shadowScale = resident.isBeingCarried ? 1.4 : 1.0;
    ctx.beginPath(); ctx.ellipse(0, 14 - liftOffset, 12 * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2); ctx.fill();

    let bounce = (resident.path && resident.currentPathIndex < resident.path.length) ? Math.abs(Math.sin(tickCount * 0.22)) * 3 : 0;
    if (resident.isBeingCarried) bounce = Math.sin(tickCount * 0.3) * 4; // Wiggle legs when carried!

    // Body & Clothes
    ctx.fillStyle = resident.bodyColor;
    ctx.beginPath(); ctx.roundRect(-10, -2 - bounce, 20, 16, 6); ctx.fill();
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1.5; ctx.stroke();

    // Legs (Dangle/Wiggle when carried)
    ctx.fillStyle = '#334155';
    let legOffset = Math.sin(tickCount * 0.28) * 5;
    ctx.fillRect(-6, 12 - bounce + (resident.isBeingCarried ? legOffset : 0), 4, 7);
    ctx.fillRect(2, 12 - bounce + (resident.isBeingCarried ? -legOffset : 0), 4, 7);

    // Hair Back
    ctx.fillStyle = resident.hairColor;
    if (resident.hairStyle === 'ponytail') { ctx.beginPath(); ctx.arc(-14, -18 - bounce, 8, 0, Math.PI * 2); ctx.fill(); }
    else if (resident.hairStyle === 'twintail') { ctx.beginPath(); ctx.arc(-16, -16 - bounce, 7, 0, Math.PI * 2); ctx.arc(16, -16 - bounce, 7, 0, Math.PI * 2); ctx.fill(); }
    else if (resident.hairStyle === 'afro') { ctx.beginPath(); ctx.arc(0, -22 - bounce, 18, 0, Math.PI * 2); ctx.fill(); }

    // Head
    let headX = -14; let headY = -28 - bounce;
    ctx.fillStyle = resident.expression === 'wet' ? '#e0f2fe' : '#ffffff';
    ctx.beginPath(); ctx.roundRect(headX, headY, 28, 28, 6); ctx.fill();
    ctx.strokeStyle = '#000000'; ctx.lineWidth = 2.2; ctx.stroke();

    // Facial Features
    this.renderVectorFace(ctx, resident.isBeingCarried ? 'surprised' : resident.expression, headX, headY, tickCount);

    // Hair Front
    ctx.fillStyle = resident.hairColor;
    if (resident.hairStyle === 'short' || resident.hairStyle === 'spiky') {
      ctx.beginPath(); ctx.moveTo(-14, headY + 6); ctx.lineTo(-6, headY - 4); ctx.lineTo(0, headY + 4); ctx.lineTo(6, headY - 4); ctx.lineTo(14, headY + 6); ctx.lineTo(14, headY - 2); ctx.lineTo(-14, headY - 2); ctx.closePath(); ctx.fill();
    } else if (resident.hairStyle === 'bob') {
      ctx.beginPath(); ctx.arc(0, headY + 4, 15, Math.PI, 0); ctx.fill(); ctx.fillRect(-15, headY + 4, 5, 12); ctx.fillRect(10, headY + 4, 5, 12);
    }

    ctx.restore();

    // Non-overlapping Speech Bubble Renderer
    window.SpeechBubbleRenderer.render(ctx, resident, tickCount);
  },

  renderVectorFace(ctx, expression, hx, hy, tickCount) {
    let eyeY = hy + 11;
    let mouthY = hy + 21;

    switch (expression) {
      case 'surprised':
        ctx.fillStyle = '#000000';
        ctx.beginPath(); ctx.arc(-6, eyeY, 3, 0, Math.PI * 2); ctx.arc(6, eyeY, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(0, mouthY - 2, 4, 0, Math.PI * 2); ctx.stroke();
        let sweatY = hy + 4 + ((tickCount * 0.4) % 6);
        ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(10, sweatY, 2.5, 0, Math.PI * 2); ctx.fill();
        break;

      case 'smile':
      case 'cooking':
      case 'warming':
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(-6, eyeY + 1, 4, Math.PI, 0); ctx.arc(6, eyeY + 1, 4, Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, mouthY - 3, 5, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
        ctx.fillStyle = 'rgba(255, 118, 117, 0.7)';
        ctx.beginPath(); ctx.arc(-8, eyeY + 6, 3.5, 0, Math.PI * 2); ctx.arc(8, eyeY + 6, 3.5, 0, Math.PI * 2); ctx.fill();
        break;

      case 'in_love':
        ctx.fillStyle = '#ff4757'; ctx.font = '11px sans-serif';
        ctx.fillText('♥', -11, eyeY + 5); ctx.fillText('♥', 1, eyeY + 5);
        ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(0, mouthY - 2, 4, 0, Math.PI); ctx.fill();
        break;

      case 'crying':
      case 'wet':
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-8, eyeY - 2); ctx.lineTo(-4, eyeY - 2); ctx.moveTo(-6, eyeY - 2); ctx.lineTo(-6, eyeY + 4);
        ctx.moveTo(4, eyeY - 2); ctx.lineTo(8, eyeY - 2); ctx.moveTo(6, eyeY - 2); ctx.lineTo(6, eyeY + 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-5, mouthY); ctx.quadraticCurveTo(-2.5, mouthY - 3, 0, mouthY); ctx.quadraticCurveTo(2.5, mouthY + 3, 5, mouthY); ctx.stroke();
        let dropY = eyeY + 4 + ((tickCount * 0.6) % 8);
        ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(-6, dropY, 2.5, 0, Math.PI * 2); ctx.arc(6, dropY, 2.5, 0, Math.PI * 2); ctx.fill();
        break;

      case 'angry':
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(-9, eyeY - 3); ctx.lineTo(-4, eyeY + 1); ctx.moveTo(9, eyeY - 3); ctx.lineTo(4, eyeY + 1); ctx.stroke();
        ctx.fillStyle = '#000000'; ctx.fillRect(-6, eyeY + 2, 3, 3); ctx.fillRect(4, eyeY + 2, 3, 3);
        ctx.beginPath(); ctx.rect(-5, mouthY - 3, 10, 5); ctx.stroke();
        break;

      default:
        ctx.fillStyle = '#000000';
        ctx.fillRect(-6, eyeY - 1, 3, 5); ctx.fillRect(4, eyeY - 1, 3, 5);
        ctx.fillRect(-6, mouthY - 1, 12, 2.5);
        break;
    }
  }
};
