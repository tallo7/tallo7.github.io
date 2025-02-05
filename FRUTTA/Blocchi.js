class Blocchi {
    constructor(x, y, result, image) {
      this.x = x;
      this.y = y;
      this.result = result;
      this.image = image;
    }
  
    draw() {
      image(this.image, this.x - 25, this.y + 25, 200, 160);
      fill(0);
      textSize(20);
      textAlign(CENTER, CENTER);
      text(this.operation, this.x + 80, this.y + 100);
    }
  }