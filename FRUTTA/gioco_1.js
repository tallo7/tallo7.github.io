let handPose;
let video;
let hands = [];
let connections;
let blocks = [];
let results = [];
let isGrabbing = false;
let grabbedObject = null;
let message = "";
let backgroundImage;
let mela, pesca, ciliegia, cesto;

// Precarica le immagini e avvia il rilevamento delle mani
function preload() {
  handPose = ml5.handPose({ flipped: true });
  backgroundImage = loadImage('img/sfondo1.jpg');
  mela = loadImage('img/mela.png');
  pesca = loadImage('img/pesca.png');
  ciliegia = loadImage('img/ciliegia.png');
  cesto_mela = loadImage('img/cesto_mela 2.0.png');
  cesto_pesca = loadImage('img/cesto_pesca 2.0.png');
  cesto_ciliegia = loadImage('img/cesto_ciliegia 2.0.png');
}

// Configura il canvas e avvia il rilevamento delle mani
function setup() {
  let canvas = createCanvas(981, 600);
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  canvas.position(x, y);

  video = createCapture(VIDEO);
  video.size(981, 600);
  video.hide();
  handPose.detectStart(video, gotHands);
  connections = handPose.getConnections();
  image(backgroundImage, 0, 0, 981, 600);

  // Crea i blocchi e i frutti
  blocks.push(new Blocchi(200, 324, 1, cesto_mela));
  blocks.push(new Blocchi(450, 324, 3, cesto_ciliegia));
  blocks.push(new Blocchi(735, 324, 2, cesto_pesca));

  results.push(new Frutti(600, 300, 1, mela));
  results.push(new Frutti(770, 300, 1, mela));
  results.push(new Frutti(730, 250, 1, mela));
  results.push(new Frutti(645, 250, 1, mela));
  results.push(new Frutti(685, 190, 1, mela));

  results.push(new Frutti(360, 325, 2, pesca));
  results.push(new Frutti(405, 235, 2, pesca));
  results.push(new Frutti(455, 235, 2, pesca));
  results.push(new Frutti(510, 315, 2, pesca));

  results.push(new Frutti(70, 210, 3, ciliegia));
  results.push(new Frutti(50, 310, 3, ciliegia));
  results.push(new Frutti(200, 225, 3, ciliegia));
  results.push(new Frutti(230, 340, 3, ciliegia));
}

// Ciclo principale di disegno
function draw() {
  push();
  translate(width, 0);
  scale(-1, 1);
  pop();
  image(backgroundImage, 0, 0, 981, 600);
  drawHands();
  drawBlocks();
  drawResults();
  checkGrabbing();
  displayMessage();
}

// Disegna le mani rilevate
function drawHands() {
  for (let hand of hands) {
    for (let [pointAIndex, pointBIndex] of connections) {
      let pointA = hand.keypoints[pointAIndex];
      let pointB = hand.keypoints[pointBIndex];
      stroke(255, 0, 0);
      strokeWeight(2);
      line(pointA.x, pointA.y, pointB.x, pointB.y);
    }
  }

  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < hand.keypoints.length; j++) {
      if (j == 4 || j == 8) {
        let keypoint = hand.keypoints[j];
        fill(25, 1, 2);
      } else {
        fill(0, 255, 0);
      }
      let keypoint = hand.keypoints[j];
      noStroke();
      circle(keypoint.x, keypoint.y, 10);
    }
  }
}

// Disegna i blocchi
function drawBlocks() {
  for (let block of blocks) {
    block.draw();
  }
}

// Disegna i frutti
function drawResults() {
  for (let result of results) {
    result.draw();
  }
}

// Controlla se la mano sta afferrando un oggetto
function checkGrabbing() {
  if (hands.length > 0) {
    let hand = hands[0];
    let thumbTip = hand.keypoints[4];
    let indexTip = hand.keypoints[8];
    let distance = dist(thumbTip.x, thumbTip.y, indexTip.x, indexTip.y);

    isGrabbing = distance < 20;
    if (!isGrabbing) grabbedObject = null;

    if (isGrabbing) {
      let palm = hand.keypoints[4];
      if (!grabbedObject) {
        for (let result of results) {
          if (dist(palm.x, palm.y, result.x, result.y) < 20) {
            grabbedObject = result;
            break;
          }
        }
      }
      if (grabbedObject) {
        grabbedObject.x = palm.x;
        grabbedObject.y = palm.y;
      }
    }
  }
}

let cont = 13;
let errori = 0;
let past = null; // Variabile per tenere traccia dell'ultimo cesto sbagliato

// Mostra il messaggio di feedback
function displayMessage() {
  for (let block of blocks) {
    if (grabbedObject && dist(grabbedObject.x, grabbedObject.y, block.x + 80, block.y + 100) < 20) {
      if (grabbedObject.value === block.result) {
        message = "Bravo!";
        results = results.filter(result => result !== grabbedObject);
        grabbedObject = null;
        cont--;
        past = null; // Resetta l'ultimo cesto sbagliato
      } else {
        if (past !== block) {
          message = "Sbagliato! Hai commesso " + (++errori) + " errori.";
          past = block; // Aggiorna l'ultimo cesto sbagliato
        } else {
          // message = "Sbagliato, ma il cesto è lo stesso. Non aumenti errori.";
        }
      }
      text(message, 320, 420);
      break;
    }
  }

  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  if (cont == 0) {
    if (errori > 3) {
      text("Hai perso \nHai commesso " + errori + " errori.", 320, 460);
    } else {
      message = "Hai vinto!!!\nHai commesso " + errori + " errori.";
      text(message, 220, 420);
    }
  }
}

// Ottieni i risultati del rilevamento delle mani
function gotHands(results) {
  hands = results;
}
