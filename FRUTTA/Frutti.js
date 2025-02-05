class Frutti {
    constructor(x, y, value, image) {
      this.x = x;
      this.y = y;
      this.value = value;
      this.image = image;
    }
  
    draw() {
      image(this.image, this.x - 25, this.y - 25, 50, 50);
    }
  }s