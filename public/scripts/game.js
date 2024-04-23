let gameState = {
  chickenLane: 0,
  carScreenTime: 1000,
  carGenerationTime: 400,
  carFrequency: 0.95,
  level: 'easy',
  isPlaying: true,
  isWaiting: false,
}

let userState = {
  balance: 0,
  username: null,
  loggedIn: false,
}

const objectState = {
  chicken: null,
  pipes: [],
  lanes: [],
}

setInterval(() => {
  for (var i = 1; i <= 15; i++) {
    if (i > gameState.chickenLane + 1) {
      Math.random() >= gameState.carFrequency && genCar(i, Math.floor(Math.random() * 8) + 1);
    }
  }
}, gameState.carGenerationTime)

document.addEventListener("DOMContentLoaded", function () {
  objectState.chicken = document.getElementById("chicken");
  objectState.pipes = document.querySelectorAll(`[game-class="pipe"]`);
  objectState.lanes = document.querySelectorAll(`[game-class="lane"]`);
  moveChickenLane();
  setLevel('easy');
  setActiveLane(1);
  loadProfile();
  loadGame();
  window.scrollTo(0, 1);
  setTimeout(() => {
    loadProfile();
  }, 10000);
});
document.addEventListener("screenChange", function () {
  transformXGameView();
});

function moveChickenLane() {
  const pipe = document.querySelector(`[lane="${gameState.chickenLane}"] [game-class="pipe"]`);
  if (!pipe) return;
  if (gameState.chickenLane > 1) {
    const pipePosition = pipe.getBoundingClientRect();
    const chickenPosition = objectState.chicken.getBoundingClientRect();
    const distance = pipePosition.left - chickenPosition.left;
    objectState.chicken.style.transform = `translateX(${distance}px)`;
  } else if (gameState.chickenLane === 1) objectState.chicken.style.transform = "translateX(0px)";

  if (gameState.chickenLane > 1) setTimeout(() => {
    objectState.chicken.style.transition = "none";
    objectState.chicken.style.transform = "translateX(0px)";
    objectState.chicken.parentNode.removeChild(objectState.chicken);
    pipe.parentNode.appendChild(objectState.chicken);
    objectState.chicken.style.transition = "transform cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s";
  }, 300)

  setTimeout(() => setDead(gameState.chickenLane === 3), 400);

  setActiveLane(gameState.chickenLane + 1);
  transformXGameView()
}

function moveToNextPipe() {
  if (!gameState.isPlaying || gameState.isWaiting) return;
  gameState.chickenLane += 1;
  gameState.isWaiting = true;
  moveChickenLane();
}

function genCar(lane, numCar) {
  const car = document.querySelector(`[lane="${lane}"] [game-class="car-wrapper"]`);
  car.style.display = "flex";
  const newCarImage = document.createElement('img');
  newCarImage.setAttribute('src', `/assets/cars/car${numCar}.svg`);
  newCarImage.setAttribute('game-class', 'car');
  car.appendChild(newCarImage);
  newCarImage.animate(
    [
      { transform: `translateY(${-car.getBoundingClientRect().height}px)` },
      { transform: `translateY(${car.getBoundingClientRect().height}px)` },
    ], {
    duration: gameState.carScreenTime,
    iterations: 1,
    fill: 'forwards',
  }
  );
  setTimeout(() => {
    newCarImage.remove();
  }, gameState.carScreenTime);
}

function setDead(dead) {
  const lane = document.querySelector(`div.item[game-class="lane"][lane="${gameState.chickenLane}"]`);
  lane.querySelector(`[game-class="pipe"]`).style.display = "none";
  lane.querySelector(`[game-class="mul-text"]`).style.display = "none";
  if (dead == true) {
    genCar(gameState.chickenLane, Math.floor(Math.random() * 8) + 1);
    setTimeout(() => {
      objectState.chicken.src = '/assets/images/chicken-dead.svg';
      const feather = document.createElement('img');
      feather.setAttribute('src', '/assets/images/chicken-dead-feather.svg');
      feather.setAttribute('game-class', 'feather');
      objectState.chicken.parentNode.appendChild(feather);
      gameState.isPlaying = false;
      gameState.isWaiting = false;
    }, gameState.carScreenTime / 2);
  } else {
    if (lane) {
      const blockerCrack = document.createElement('img');
      blockerCrack.setAttribute('src', '/assets/images/roadBlock-crack.svg');
      blockerCrack.setAttribute('game-class', 'blocker-crack');
      lane.appendChild(blockerCrack);
      const blocker = document.createElement('img');
      blocker.setAttribute('src', '/assets/images/roadBlock.svg');
      blocker.setAttribute('game-class', 'blocker');
      lane.appendChild(blocker);
      blockerCrack.animate(
        [
          { transform: 'translateY(-55px)' },
          { transform: 'translateY(-60px)' },
        ], {
        duration: 200,
        delay: 100,
        iterations: 1,
        fill: 'forwards',
      }
      );
      blocker.animate(
        [
          { transform: `translateY(-${lane.getBoundingClientRect().y}px)` },
          { transform: 'translateY(-70px)' },
        ], {
        duration: 200,
        iterations: 1,
        fill: 'forwards',
      }
      );
      gameState.isWaiting = false;
    }
  }
  if (gameState.chickenLane - 1 > 0) {
    const previousLane = document.querySelector(`div.item[game-class="lane"][lane="${gameState.chickenLane - 1}"]`);
    const coin = document.createElement('img');
    coin.setAttribute('src', '/assets/images/coin.svg');
    coin.setAttribute('game-class', 'coin');
    coin.classList.add('coin');
    previousLane.appendChild(coin);
  }
}