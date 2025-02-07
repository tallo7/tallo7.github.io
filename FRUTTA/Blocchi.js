class Blocchi {
  constructor(x, y, result, image) {
      this.x = x;
      this.y = y;
      this.result = result;
      this.image = image;
  }

  // Disegna il blocco, mostrando l'immagine e il risultato
  draw() {
      image(this.image, this.x - 25, this.y + 25, 200, 160); // Disegna l'immagine del blocco
      fill(0);
      textSize(20);
      textAlign(CENTER, CENTER);
      text(this.result, this.x + 80, this.y + 100); // Mostra il risultato al centro del blocco
  }
}
