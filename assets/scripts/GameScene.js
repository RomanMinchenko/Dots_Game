class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  preload() {
    this.load.image('bg', './assets/sprites/bgc.png');
    this.load.image('dot1', './assets/sprites/dot1.png');
    this.load.image('dot2', './assets/sprites/dot2.png');
    this.load.image('dot3', './assets/sprites/dot3.png');
    this.load.image('dot4', './assets/sprites/dot4.png');
    this.load.image('dot5', './assets/sprites/dot5.png');
  }

  create() {
    this.data.set('time', 0)
    this.score = 0;
    this.data.set('score', this.score);
    this.add.image(200, 300, 'bg');
    this.createDots();
    this.displayText();
    this.chooseDots();
  }

  createDots() {
    this.dots = [];

    for (let col = 0; col < 6; col++) {
      for (let row = 0; row < 6; row++) {
        let dot = new Dot(this, {
          name: 'dot' + Phaser.Math.Between(1, 5),
          delay: 200 - (row * 50),
          position: {
            x: 100 + col * 40,
            y: -400 + row * 40
          }
        });

        this.dots[col * 6 + row] = dot;
        this.fallColumn(dot);
      }
    }
  }

  fallColumn(dot) {
    dot.fall();

    setTimeout(() => {
      this.correctPositions();
    }, 600);
  }

  correctPositions() {
    const positions = [];

    for (let col = 0; col < 6; col++) {
      for (let row = 0; row < 6; row++) {
        positions.push({
          i: col * 6 + row,
          position: { x: 100 + col * 40, y: 200 + row * 40}
        });
      }
    }

    this.dots.forEach((dot, i) => {
      let position = positions.find(item => item.i === i);

      dot.paramsDot.position.x = position.position.x;
      dot.paramsDot.position.y = position.position.y;
    })
  }

  chooseDots() {
    this.createLine = (x1, y1, x2, y2, graphic) => {
      let line = new Phaser.Geom.Line().setTo(x1, y1, x2, y2);

      graphic.lineStyle(4, 0xcccccc);
      graphic.strokeLineShape(line);

      return line;
    }

    this.input.on("gameobjectdown", (pointer, dot) => {
      this.lines = [];
      this.selectedDots = [];
      this.dotName = dot.paramsDot.name;

      this.graphics = this.add.graphics();
      this.line = new Phaser.Geom.Line();
      this.line.setTo(dot.x, dot.y, dot.x, dot.y);

      this.graphics.clear();
      this.graphics.lineStyle(4, 0xcccccc);
      this.graphics.strokeLineShape(this.line);
    }, this);

    this.input.on("pointermove", (pointer) => {
      if (pointer.isDown && this.line) {
        this.dots.forEach(dot => {
          if (
            pointer.x <= dot.x + 10
            && pointer.x >= dot.x - 10
            && pointer.y <= dot.y + 10
            && pointer.y >= dot.y - 10
          ) {
            if (
              (pointer.x >= this.line.x1 - 50
              && pointer.x <= this.line.x1 + 50
              && pointer.y >= this.line.y1 - 10
              && pointer.y <= this.line.y1 + 10)
              || (pointer.x >= this.line.x1 - 10
              && pointer.x <= this.line.x1 + 10
              && pointer.y >= this.line.y1 - 50
              && pointer.y <= this.line.y1 + 50)
            ) {
              if (dot.paramsDot.name === this.dotName) {
                const x1 = this.line.x1;
                const y1 = this.line.y1;

                if (!this.lines.some(line => line.x1 === x1 && line.y1 === y1 && line.x2 === dot.x && line.y2 === dot.y)) {
                  this.line.x1 = dot.x;
                  this.line.y1 = dot.y;
                  this.dots.forEach((d, i) => {
                    if (d === dot && !this.selectedDots.some(e => e === i)) {
                      this.selectedDots.push(i);
                    }
                  })
                }

                if (this.line.x1 !== x1 || this.line.y1 !== y1) {
                  const reversLine = this.lines.findIndex(line => (
                    line.x1 === dot.x
                    && line.y1 === dot.y
                    && line.x2 === x1
                    && line.y2 === y1
                  ))
                  
                  const lastDot = { x: x1, y: y1 };

                  if (reversLine !== -1) {
                    this.lines[reversLine].graphic.destroy();
                    this.lines.splice(reversLine, 1);
                    const index = this.dots.findIndex(d => d.x === lastDot.x && d.y === lastDot.y);
                    this.selectedDots.splice(
                      this.selectedDots.findIndex(i => i === index), 1
                    );
                  } else {
                    this.lines.push({
                      x1: x1,
                      y1: y1,
                      x2: dot.x,
                      y2: dot.y,
                      graphic: this.add.graphics(),
                    });
                  }
                  
                  this.lines.forEach(line => this.createLine(line.x1, line.y1, line.x2, line.y2, line.graphic));
                }
              }
            }
          }
        });

        this.line.x2 = pointer.x;
        this.line.y2 = pointer.y;

        this.graphics.clear();
        this.graphics.lineStyle(4, 0xcccccc);
        this.graphics.strokeLineShape(this.line);
      }
    })
    
    this.input.on("pointerup", (pointer) => {
      this.graphics.clear();
      this.lines.forEach(line => line.graphic.clear());

      if (this.selectedDots.length > 1) {
        this.selectedDots.sort((a, b) => a - b);
        this.deleteDots(this.selectedDots);
        this.scoreCount(this.selectedDots.length);
      }
    })
  }

  deleteDots(indexes) {
    indexes.forEach(i => {
      this.dots[i].delete();
    })

    setTimeout (() => {
      this.fallDots(indexes);
    }, 200)
  }

  fallDots(indexes) {
    const check = [
      { from: 0, to: 5, count: 0, fall: [] },
      { from: 6, to: 11, count: 0, fall: [] },
      { from: 12, to: 17, count: 0, fall: [] },
      { from: 18, to: 23, count: 0, fall: [] },
      { from: 24, to: 29, count: 0, fall: [] },
      { from: 30, to: 35, count: 0, fall: [] },
    ];

    const newDots = [];

    indexes.forEach(index => {
      check.forEach(item => {
        if (index >= item.from && index <= item.to) {
          item.count += 1;
          let i = index - 1;
          if (index !== item.from) {
            while (i >= item.from) {
              if (!item.fall.some(s => s === i)) {
                item.fall.push(i);
              }
              i--;
            };
          }
          newDots.push({ i: item.from, in: index, count: item.count - 1 })
          item.fall.sort((a, b) => a - b);
        }
      })
    });

    check.forEach(item => {
      item.fall.forEach(i => {
        this.dots[i].fall(item.count);
      });
    });

    this.createNewDots(newDots);
  }

  createNewDots(indexes) {
    indexes.forEach(index => {
      let dot = new Dot(this, {
        name: 'dot' + Phaser.Math.Between(1, 5),
        delay: 200 - ((index.i + index.count) % 6) * 50,
        position: {
          x: 100 + ((index.i - index.i % 6) / 6) * 40,
          y: -400 + index.count * 40
        }
      });

      this.dots.splice(index.in, 1);
      this.dots.splice(index.i + index.count, 0, dot);
      this.fallColumn(dot);
    });
  }

  displayText() {
    this.text = this.add.text(32, 32, 'Score: 0', {
      font: '18px Sans-serif',
      fill: '#000'
    })
  }

  scoreCount(count) {
    this.score += count;

    this.text.setText('Score: ' + this.score);
  }
}
