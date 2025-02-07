// Dichiarazione delle variabili per il rilevamento delle mani, il video e gli elementi del gioco
let rilevaMani;
let video;
let mani = [];
let connessioni;
let carte = [];
let carteGirate = [];
let coppieAbbinate = 0;
let immagineRetroCarta;
let immaginiCarte = [];
let immagineSfondo;
let larghezzaCarta = 150;
let altezzaCarta = 200;
let giocoIniziato = false;
let giocoFinito = false;

class Carta {
  constructor(x, y, immagine) {
    this.x = x;
    this.y = y;
    this.immagine = immagine;
    this.girata = false;
    this.abbinata = false;
  }

  // Disegna la carta, mostrando l'immagine se è girata o abbinata
  disegna() {
    if (this.girata || this.abbinata) {
      image(this.immagine, this.x, this.y, larghezzaCarta, altezzaCarta);
    } else {
      image(immagineRetroCarta, this.x, this.y, larghezzaCarta, altezzaCarta);
    }
  }

  // Gira la carta
  gira() {
    suono();
    this.girata = !this.girata;
  }

  // Verifica se la carta è stata cliccata
  cliccata(px, py) {
    return px > this.x && px < this.x + larghezzaCarta && py > this.y && py < this.y + altezzaCarta;
  }
}

// Precarica le immagini e avvia il rilevamento delle mani
function preload() {
  rilevaMani = ml5.handPose({ flipped: true });
  immagineRetroCarta = loadImage('retro.jpg');
  for (let i = 0; i < 6; i++) {
    immaginiCarte.push(loadImage(`monumenti{${i}}.png`));
  }
  immagineSfondo = loadImage('sfondo.jpg'); // Carica l'immagine dello sfondo
}

// Configura il canvas e avvia il rilevamento delle mani
function setup() {
  let canvas = createCanvas(900, 680);
  canvas.parent('canvas-container');
  video = createCapture(VIDEO);
  video.size(900, 680);
  video.hide();
  rilevaMani.detectStart(video, ottieniMani);
  connessioni = rilevaMani.getConnections();
}

// Ciclo principale di disegno
function draw() {
  background(220);
  image(immagineSfondo, 0, 0, width, height); // Disegna lo sfondo

  if (!giocoIniziato) {
    visualizzaPaginaIniziale();
  } else if (!giocoFinito) {
    disegnaMani();
    for (let carta of carte) {
      carta.disegna();
    }
    controllaFineGioco();
  } else {
    visualizzaFineGioco();
  }
}

// Visualizza la pagina iniziale
function visualizzaPaginaIniziale() {
  fill(0, 102, 204);
  rectMode(CENTER);
  rect(width / 2, height / 2, 200, 100, 10);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Start", width / 2, height / 2);
}

// Inizializza le carte
function inizializzaCarte() {
  let posizioni = [];
  for (let i = 0; i < 12; i++) {
    let x = (i % 4) * (larghezzaCarta + 20) + (width - (4 * larghezzaCarta + 3 * 20)) / 2;
    let y = floor(i / 4) * (altezzaCarta + 20) + (height - (3 * altezzaCarta + 2 * 20)) / 2;
    posizioni.push({ x, y });
  }
  posizioni = shuffle(posizioni);

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 2; j++) {
      let pos = posizioni.pop();
      carte.push(new Carta(pos.x, pos.y, immaginiCarte[i]));
    }
  }
}

// Disegna le mani e rileva i clic
function disegnaMani() {
  for (let mano of mani) {
    for (let [indicePuntoA, indicePuntoB] of connessioni) {
      let puntoA = mano.keypoints[indicePuntoA];
      let puntoB = mano.keypoints[indicePuntoB];
      stroke(255, 0, 0);
      strokeWeight(2);
      line(puntoA.x, puntoA.y, puntoB.x, puntoB.y);
    }
  }

  for (let mano of mani) {
    let pollicePunta = mano.keypoints[4];
    let indicePunta = mano.keypoints[8];
    let distanza = dist(pollicePunta.x, pollicePunta.y, indicePunta.x, indicePunta.y);

    if (distanza < 30) {
      for (let carta of carte) {
        if (carta.cliccata(indicePunta.x, indicePunta.y) && !carta.girata && carteGirate.length < 2) {
          carta.gira();
          carteGirate.push(carta);
          if (carteGirate.length === 2) {
            setTimeout(controllaAbbinamento, 1000);
          }
        }
      }
    }

    for (let keypoint of mano.keypoints) {
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 10);
    }
  }
}

// Verifica se le carte girate corrispondono
function controllaAbbinamento() {
  if (carteGirate[0].immagine === carteGirate[1].immagine) {
    suono1();
    carteGirate[0].abbinata = true;
    carteGirate[1].abbinata = true;
    coppieAbbinate++;
  } else {
    carteGirate[0].gira();
    carteGirate[1].gira();
  }
  carteGirate = [];
}

// Verifica se il gioco è finito
function controllaFineGioco() {
  if (coppieAbbinate === 6) {
    suono2();
    carte = [];
    giocoFinito = true;
  }
}

// Visualizza la schermata di fine gioco
function visualizzaFineGioco() {
  fill(255, 0, 0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Hai vinto", width / 2, height / 2 - 50);
  textSize(24);
  text("Vuoi rigiocare?", width / 2, height / 2 + 50);

  fill(0, 255, 0);
  rect(width / 2 , height / 2 + 105, 120, 50);

  fill(0);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("Rigioca", width / 2, height / 2 + 105);
}

// Gestisce i clic del mouse per iniziare o riavviare il gioco
function mousePressed() {
  if (!giocoIniziato && mouseX > width / 2 - 100 && mouseX < width / 2 + 100 && mouseY > height / 2 - 50 && mouseY < height / 2 + 50) {
    giocoIniziato = true;
    inizializzaCarte();
  }

  if (giocoFinito && mouseX > width / 2 - 60 && mouseX < width / 2 + 60 && mouseY > height / 2 + 80 && mouseY < height / 2 + 130) {
    coppieAbbinate = 0;
    carteGirate = [];
    inizializzaCarte();
    giocoFinito = false;
    loop();
  }
}

// Ottieni i risultati del rilevamento delle mani
function ottieniMani(risultati) {
  mani = risultati;
}

// Riproduci effetti sonori
function suono() {
  var snd = new Audio("mixkit-air-zoom-vacuum-2608.wav");
  snd.play().catch(error => {
    console.log("Errore nella riproduzione del suono:", error);
  });
}

function suono1() {
  var snd = new Audio("correct-6033.mp3");
  snd.play().catch(error => {
    console.log("Errore nella riproduzione del suono:", error);
  });
}

function suono2() {
  var snd = new Audio("victory.mp3");
  snd.play().catch(error => {
    console.log("Errore nella riproduzione del suono:", error);
  });
}
