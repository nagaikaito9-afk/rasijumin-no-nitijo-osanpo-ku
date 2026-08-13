/**
 * camera_system.js - Camera Pan, Zoom & Follow Controller
 */

class CameraSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.zoom = 0.95;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.followingResident = null;
  }

  centerOn(worldWidth, worldHeight) {
    this.panX = (this.canvas.width - worldWidth * this.zoom) / 2;
    this.panY = (this.canvas.height - worldHeight * this.zoom) / 2;
  }

  updateFollow() {
    if (this.followingResident) {
      let targetPanX = this.canvas.width / 2 - this.followingResident.x * this.zoom;
      let targetPanY = this.canvas.height / 2 - this.followingResident.y * this.zoom;
      this.panX += (targetPanX - this.panX) * 0.1;
      this.panY += (targetPanY - this.panY) * 0.1;
    }
  }
}

window.CameraSystem = CameraSystem;
