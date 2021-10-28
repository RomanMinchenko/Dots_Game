class Dot extends Phaser.GameObjects.Sprite {
  constructor(scene, paramsDot) {
    super(scene, paramsDot.position.x, paramsDot.position.y, paramsDot.name);
    this.scene = scene;
    this.paramsDot = paramsDot;
    this.setInteractive();
    this.scene.add.existing(this);
    this.input.hitArea.width = 40;
    this.input.hitArea.height = 40;
    this.input.hitArea.left = -10;
    this.input.hitArea.top = -10;
    this.input.hitArea.right = 30;
    this.input.hitArea.bottom = 30;
  }

  fall(count = 15) {
    this.scene.tweens.add({
      targets: this,
      y: this.paramsDot.position.y + (40 * count) + 5,
      delay: this.paramsDot.delay,
      ease: 'Linear',
      duration: count * (count <= 6 ? 48 : 16),
      onComplete: () => {
        this.scene.tweens.add({
          targets: this,
          y: this.paramsDot.position.y + 40 * count,
          duration: count * 7,
        })
      }
    })
  }

  delete() {
    this.scene.tweens.add({
      targets: this,
      scale: 1.1,
      duration: 50,
      onComplete: () => {
        this.scene.tweens.add({
          targets: this,
          scale: 0,
          duration: 50,
        })
      }
    })
  }
}
