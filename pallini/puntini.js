let rilevaMani;
let video;
let mani = [];
let connessioni;
let gioco;
let sfondo;
let snd_vittoria;
let snd_rosso;
let snd_verde;

// Precarica le immagini e i suoni
function preload() {
  rilevaMani = ml5.handPose({ flipped: true });
  sfondo = loadImage('cabinato.png');
  snd_rosso = new Audio("wrong.mp3");
  snd_vittoria = new Audio("victory.mp3");
  snd_verde = new Audio("positive.mp3");
}

// Configura il canvas e avvia il rilevamento delle mani
function setup() {
  let canvas = createCanvas(900, 680);
  canvas.parent('canvas-container');
  video = createCapture(VIDEO);
  video.size(900, 680);
  video.hide();
  rilevaMani.detectStart(video, (results) => gioco.ottieniMani(results));
  connessioni = rilevaMani.getConnections();

  gioco = new Gioco();
  gioco.inizia();
}

// Ciclo principale di disegno
function draw() {
  background(sfondo);

  if (!gioco.iniziato) {
    gioco.mostraTitolo();
    return;
  }

  // gioco.mostraVideo(video);

  if (gioco.vinto) {
    gioco.mostraVittoria();
    return;
  }

  gioco.aggiorna();
  gioco.controllaCollisioni();
}

// Gestisce i clic del mouse per iniziare o riavviare il gioco
function mousePressed() {
  gioco.controllaPulsanti(mouseX, mouseY);
}

class Gioco {
  constructor() {
    this.palliniVerdi = [];
    this.palliniRossi = [];
    this.punteggio = 0;
    this.raggioPallino = 20;
    this.distanzaMinima = 40;
    this.mani = new Mani();
    this.vinto = false;
    this.iniziato = false;
    this.creaPallini();
    this.aggiungiPallini();
  }

  // Inizia il gioco, aggiungendo nuovi pallini ogni 5 secondi
  inizia() {
    setInterval(() => {
      if (!this.vinto && this.iniziato) {
        this.creaPallino(this.palliniVerdi, color(0, 255, 0));
        this.creaPallino(this.palliniRossi, color(255, 0, 0));
      }
    }, 5000);
  }

  // Crea i pallini iniziali
  creaPallini() {
    for (let i = 0; i < 10; i++) {
      this.creaPallino(this.palliniVerdi, color(0, 255, 0));
      this.creaPallino(this.palliniRossi, color(255, 0, 0));
    }
  }

  // Aggiunge nuovi pallini al gioco
  aggiungiPallini() {
    this.creaPallino(this.palliniVerdi, color(0, 255, 0));
    this.creaPallino(this.palliniRossi, color(255, 0, 0));
  }

  // Crea un nuovo pallino e assicura che non sia troppo vicino agli altri pallini
  creaPallino(arrayPallini, colore) {
    let nuovoPallino;
    let pallinoValido = false;

    while (!pallinoValido) {
      nuovoPallino = new Pallino(random(this.raggioPallino, width - this.raggioPallino), random(this.raggioPallino, height - this.raggioPallino), this.raggioPallino, colore);
      pallinoValido = true;

      for (let pallino of arrayPallini) {
        if (dist(nuovoPallino.x, nuovoPallino.y, pallino.x, pallino.y) < this.distanzaMinima) {
          pallinoValido = false;
          break;
        }
      }
    }

    arrayPallini.push(nuovoPallino);
  }

  // Mostra il titolo del gioco e il pulsante per iniziare
  mostraTitolo() {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Schiaccia i pallini verdi \n  Evita quelli rossi", width / 2, 120);
    this.disegnaPulsante("Inizia", width / 2, height / 2);
  }

  // Mostra il video (funzione disattivata)
  mostraVideo(video) {
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);
    pop();
  }

  // Mostra il messaggio di vittoria e il pulsante per rigiocare
  mostraVittoria() {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Hai vinto!", width / 2, 50);
    this.disegnaPulsante("Rigioca", width / 2, height / 2 + 50);
  }

  // Aggiorna lo stato del gioco, disegnando i pallini e controllando il punteggio
  aggiorna() {
    for (let pallino of this.palliniVerdi) {
      pallino.mostra();
    }

    for (let pallino of this.palliniRossi) {
      pallino.mostra();
    }

    this.mani.disegna();

    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Punteggio: " + this.punteggio, width / 2, 50);

    if (this.punteggio >= 10) {
      this.vittoria();
    }
  }

  // Controlla le collisioni tra le mani e i pallini
  controllaCollisioni() {
    this.mani.controllaCollisioni(this.palliniVerdi, this.palliniRossi);
  }

  // Gestisce la vittoria del gioco
  vittoria() {
    this.suono(snd_vittoria);
    this.vinto = true;
    this.palliniVerdi = [];
    this.palliniRossi = [];
  }

  // Controlla i pulsanti del gioco
  controllaPulsanti(mouseX, mouseY) {
    if (!this.iniziato && mouseX > width / 2 - 50 && mouseX < width / 2 + 50 && mouseY > height / 2 - 25 && mouseY < height / 2 + 25) {
      this.iniziato = true;
    }

    if (this.vinto && mouseX > width / 2 - 50 && mouseX < width / 2 + 50 && mouseY > height / 2 + 25 && mouseY < height / 2 + 75) {
      this.resetta();
    }
  }

  // Disegna un pulsante sul canvas
  disegnaPulsante(label, x, y) {
    fill(0, 102, 204);
    rectMode(CENTER);
    rect(x, y, 100, 50, 10);
    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(label, x, y);
  }

  // Riproduce un suono
  suono(snd) {
    snd.play().catch(error => {
      console.log("Errore nella riproduzione del suono:", error);
    });
  }

  // Resetta lo stato del gioco
  resetta() {
    this.punteggio = 0;
    this.vinto = false;
    this.iniziato = false;
    this.creaPallini();
  }

  // Ottiene i risultati del rilevamento delle mani
  ottieniMani(results) {
    this.mani.ottieni(results);
  }
}

class Pallino {
  constructor(x, y, raggio, colore) {
    this.x = x;
    this.y = y;
    this.raggio = raggio;
    this.colore = colore;
  }

  // Mostra il pallino
  mostra() {
    fill(this.colore);
    ellipse(this.x, this.y, this.raggio, this.raggio);
  }
}

class Mani {
  constructor() {
    this.mani = [];
    this.indiceX = 0;
    this.indiceY = 0;
  }

  // Ottiene i risultati del rilevamento delle mani
  ottieni(results) {
    this.mani = results;
  }

  // Disegna le mani rilevate
  disegna() {
    if (this.mani.length > 0) {
      let mano = this.mani[0];
      let indice = mano.keypoints[8];
      this.indiceX = lerp(this.indiceX, indice.x, 0.2);
      this.indiceY = lerp(this.indiceY, indice.y, 0.2);
      fill(0, 0, 255);
      noStroke();
      circle(this.indiceX, this.indiceY, 30);
    }
  }

  // Controlla le collisioni tra le mani e i pallini verdi e rossi

  controllaCollisioni(palliniVerdi, palliniRossi) {
    if (this.mani.length > 0) {
      let mano = this.mani[0];
      let indice = mano.keypoints[8];

      for (let i = palliniVerdi.length - 1; i >= 0; i--) {
        let pallino = palliniVerdi[i];
        if (dist(indice.x, indice.y, pallino.x, pallino.y) < pallino.raggio / 2) {
          palliniVerdi.splice(i, 1);
          gioco.suono(snd_verde);
          gioco.punteggio++;
        }
      }

      for (let i = palliniRossi.length - 1; i >= 0; i--) {
        let pallino = palliniRossi[i];
        if (dist(indice.x, indice.y, pallino.x, pallino.y) < pallino.raggio / 2) {
          palliniRossi.splice(i, 1);
          gioco.suono(snd_rosso);
          gioco.punteggio--;
        }
      }
    }
  }
}


