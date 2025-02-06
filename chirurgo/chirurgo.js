let handPose;
let video;
let hands = [];
let connections;
let blocks = [];
let results = [];
let isGrabbing = false;
let grabbedObject = null;
let message = "", controllo = "";
let backgroundImage;
let cuore, cervello, stomaco, osso, osso_mano, polmone, organo_trasparente, omino;

function preload() {
  handPose = ml5.handPose({ flipped: true });
  backgroundImage = loadImage('img/sala_operatoria.png');
  cuore = loadImage('img/cuore.png');
  cervello = loadImage('img/cervello.png');
  stomaco = loadImage('img/stomaco.png');
  osso = loadImage('img/osso.png');
  //polmone = loadImage('img/polmone_2.png');
  organo_trasparente = loadImage('img/organo_trasparente.png');
  osso_mano = loadImage('img/osso_mano.png');
  omino = loadImage('img/omino_2.png');
}

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
  image(omino, 350, 60, 300, 540);
  blocks.push(new Blocco(460, 40, 2, organo_trasparente));
  blocks.push(new Blocco(425, 455, 3, organo_trasparente));
  blocks.push(new Blocco(465, 266, 1, organo_trasparente));
  blocks.push(new Blocco(460, 310, 4, organo_trasparente));
  blocks.push(new Blocco(565, 346, 5, organo_trasparente));
  results.push(new Organi(600, 300, 1, cuore));
  results.push(new Organi(770, 300, 2, cervello));
  results.push(new Organi(730, 250, 3, osso));
  results.push(new Organi(650, 350, 4, stomaco));
  results.push(new Organi(680, 400, 5, osso_mano));
}

function draw() {
  push();
  translate(width, 0);
  scale(-1, 1);
  pop();
  image(backgroundImage, 0, 0, 981, 600);
  image(omino, 350, 60, 300, 540);
  drawHands();
  drawBlocks();
  drawResults();
  checkGrabbing();
  displayMessage();
}

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

function drawBlocks() {
  for (let block of blocks) {
    block.draw();
  }
}

function drawResults() {
  for (let result of results) {
    result.draw();
  }
}

function checkGrabbing() {
  if (hands.length > 0) {
    let hand = hands[0];
    let thumbTip = hand.keypoints[4];
    let indexTip = hand.keypoints[8];
    let distance = dist(thumbTip.x, thumbTip.y, indexTip.x, indexTip.y);

    isGrabbing = distance < 20;
    if (!isGrabbing) grabbedObject = null;

    if (isGrabbing) {
      let palmX = (thumbTip.x + indexTip.x) / 2;
      let palmY = (thumbTip.y + indexTip.y) / 2;
      if (!grabbedObject) {
        for (let result of results) {
          if (dist(palmX, palmY, result.x + 50, result.y + 50) < 50) {
            grabbedObject = result;
            break;
          }
        }
      }
      if (grabbedObject) {
        grabbedObject.x = palmX - 50;
        grabbedObject.y = palmY - 50;
      }
    }
  }
}

let cont = 5;
let errori = 0;
let past = null;

function displayMessage() {
  for (let block of blocks) {
    if (grabbedObject) {
      let blockLeft = block.x;
      let blockRight = block.x + 100;
      let blockTop = block.y;
      let blockBottom = block.y + 100;

      let centerX = grabbedObject.x + 50;
      let centerY = grabbedObject.y + 50;
      message = "";
      if (centerX >= blockLeft && centerX <= blockRight && centerY >= blockTop && centerY <= blockBottom) {
        if (grabbedObject.value === block.result) {
          if (!grabbedObject.isPlaced) { // Verifica se l'oggetto è già stato posizionato
            message = "Bravo!";
            grabbedObject.isPlaced = true; // Aggiorna lo stato di posizionamento
            cont--;
          }
          results = results.filter(result => result !== grabbedObject);
          past = null;

          // Aggiorna l'immagine del blocco
          block.image = grabbedObject.image;
        } else {
          if (past !== block) {
            message = "Sbagliato! Hai commesso " + (++errori) + " errori.";
            past = block;
          }
        }
        break;
      }
    }
  }

  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(message, width / 2, height - 50);

  if (cont == 0) {
    if (errori > 3) {
      message = "Hai perso\nHai commesso " + errori + " errori.";
    } else {
      message = "Hai vinto!!!\nHai commesso " + errori + " errori.";
    }
    text(message, width / 2, height-50);
  }
}
function gotHands(results) {
  hands = results;
}

class Blocco {
  constructor(x, y, result, image) {
    this.x = x;
    this.y = y;
    this.result = result;
    this.image = image;
  }

  draw() {
    image(this.image, this.x, this.y, 100, 100);
  }
}

class Organi {
  constructor(x, y, value, image) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.image = image;
    this.isPlaced = false; // Aggiunto per tracciare lo stato di posizionamento
  }

  draw() {
    image(this.image, this.x, this.y, 100, 100);
  }
}