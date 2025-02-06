let rilevaMani;
let video;
let connessioni;
let gioco;
let sfondo;

function preload() {
  rilevaMani = ml5.handPose({ flipped: true }, modelloPronto);
  sfondo = loadImage('cabinato.png');
  snd_colpito = new Audio("error.mp3");
  snd_fine = new Audio("gameover.mp3");
}

function modelloPronto() {
  console.log('Modello caricato correttamente');
}

function setup() {
  let canvas = createCanvas(800, 580);
  canvas.parent('canvas-container');
  video = createCapture(VIDEO);
  video.size(800, 580);
  video.hide();
  rilevaMani.detectStart(video, (results) => gioco.ottieniMani(results));
  connessioni = rilevaMani.getConnections();

  gioco = new Gioco();
  gioco.inizia();
}

function draw() {
  background(sfondo);

  if (!gioco.iniziato) {
    gioco.mostraTitolo();
    return;
  }

  gioco.aggiorna();
  gioco.controllaCollisioni();
}

function mousePressed() {
  gioco.controllaPulsanti(mouseX, mouseY);
}

class Gioco {
  constructor() {
    this.giocatore = new Giocatore(width / 2, height - 100, 20);
    this.ostacoli = [];
    this.mani = new Mani();
    this.punteggio = 0;
    this.vite = 3;
    this.iniziato = false;
    this.vinto = false;
    this.creaOstacoli();
  }

  inizia() {
    setInterval(() => {
      if (this.iniziato && !this.vinto) {
        this.creaOstacolo();
      }
    }, 5000);
  }

  creaOstacoli() {
    for (let i = 0; i < 10; i++) {
      this.creaOstacolo();
    }
  }

  creaOstacolo() {
    this.ostacoli.push(new Ostacolo(random(width), random(-height, 0), 20));
  }

  mostraTitolo() {
    fill(0, 255, 0);
    rectMode(CENTER);
    rect(width / 2, height / 2, 200, 100, 10);
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Inizia", width / 2, height / 2);

    if (mouseIsPressed &&
        mouseX > width / 2 - 100 &&
        mouseX < width / 2 + 100 &&
        mouseY > height / 2 - 50 &&
        mouseY < height / 2 + 50) {
      this.iniziato = true;
    }
  }

  aggiorna() {
    this.giocatore.mostra();
    this.ostacoli.forEach(ostacolo => {
      ostacolo.aggiorna(this.punteggio);
      if (ostacolo.y > height) {
        ostacolo.reset();
        this.punteggio++;
      }
    });
    this.mani.disegna();

    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Punteggio: " + this.punteggio, width / 2, 50);
    text("Vite: " + this.vite, width / 2, 100);

    if (this.vinto) {
      this.mostraVittoria();
    }
  }

  mostraVittoria() {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Gioco terminato, ottimo lavoro!", width / 2, height / 2);
    this.disegnaPulsante("Rigioca", width / 2, height / 2 + 50);
    noLoop();
  }

  controllaCollisioni() {
    this.mani.controllaCollisioni(this.giocatore, this.ostacoli);
  }

  controllaPulsanti(mouseX, mouseY) {
    if (!this.iniziato && mouseX > width / 2 - 100 && mouseX < width / 2 + 100 && mouseY > height / 2 - 50 && mouseY < height / 2 + 50) {
      this.iniziato = true;
    }

    if (this.vinto && mouseX > width / 2 - 50 && mouseX < width / 2 + 50 && mouseY > height / 2 + 25 && mouseY < height / 2 + 75) {
      this.resetta();
      loop();
    }
  }

  resetta() {
    this.punteggio = 0;
    this.vite = 3;
    this.vinto = false;
    this.iniziato = true;
    this.giocatore.reset();
    this.ostacoli = [];
    this.creaOstacoli();
  }

  disegnaPulsante(label, x, y) {
    fill(0, 102, 204);
    rectMode(CENTER);
    rect(x, y, 100, 50, 10);
    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(label, x, y);
  }

  ottieniMani(results) {
    this.mani.ottieni(results);
  }

  suono(snd){
    snd.play().catch(error => {
      console.log("Errore nella riproduzione del suono:", error);
    });
  }
}

class Giocatore {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.afferrato = false;
  }

  mostra() {
    fill(0, 0, 255);
    ellipse(this.x, this.y, this.size);
  }

  reset() {
    this.x = width / 2;
    this.y = height - 100;
  }

  muovi(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Ostacolo {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
  }

  aggiorna(punteggio) {
    this.y += 1 + punteggio / 10;
    this.mostra();
  }

  mostra() {
    fill(255, 0, 0);
    ellipse(this.x, this.y, this.size);
  }

  reset() {
    this.y = random(-height, 0);
    this.x = random(width);
  }
}

class Mani {
  constructor() {
    this.mani = [];
  }

  ottieni(results) {
    this.mani = results;
  }

  disegna() {
    for (let mano of this.mani) {
      for (let [indicePuntoA, indicePuntoB] of connessioni) {
        let puntoA = mano.keypoints[indicePuntoA];
        let puntoB = mano.keypoints[indicePuntoB];
        stroke(255, 0, 0);
        strokeWeight(2);
        line(puntoA.x, puntoA.y, puntoB.x, puntoB.y);
      }
      for (let keypoint of mano.keypoints) {
        fill(0, 255, 0);
        noStroke();
        circle(keypoint.x, keypoint.y, 10);
      }
    }
  }

  controllaCollisioni(giocatore, ostacoli) {
    for (let mano of this.mani) {
      let pollicePunta = mano.keypoints[4];
      let indicePunta = mano.keypoints[8];

      if (dist(pollicePunta.x, pollicePunta.y, indicePunta.x, indicePunta.y) < 20 &&
          dist((pollicePunta.x + indicePunta.x) / 2, (pollicePunta.y + indicePunta.y) / 2, giocatore.x, giocatore.y) < giocatore.size / 2) {
        giocatore.afferrato = true;
      }

      if (giocatore.afferrato) {
        giocatore.muovi((pollicePunta.x + indicePunta.x) / 2, (pollicePunta.y + indicePunta.y) / 2);
      }

      for (let ostacolo of ostacoli) {
        if (dist(giocatore.x, giocatore.y, ostacolo.x, ostacolo.y) < (giocatore.size + ostacolo.size) / 2) {
          gioco.suono(snd_colpito);
          gioco.vite--;
          ostacolo.reset();
          if (gioco.vite <= 0) {
            gioco.vinto = true;
            gioco.suono(snd_fine);
          }
        }
      }
    }
  }
}
