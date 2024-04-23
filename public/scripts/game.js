let gameState = {
  chickenLane: 0,
  carScreenTime: 1500,
  level: 'easy'
}

const objectState = {
  chicken: null,
  pipes: [],
  lanes: [],
}

document.addEventListener("DOMContentLoaded", function () {
  objectState.chicken = document.getElementById("chicken");
  objectState.pipes = document.querySelectorAll(`[game-class="pipe"]`);
  objectState.lanes = document.querySelectorAll(`[game-class="lane"]`);
  moveChickenLane();
  setActiveLane(1);
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

  setTimeout(() => setDead(false), 400);

  setActiveLane(gameState.chickenLane + 1);
  transformXGameView()
}

function moveToNextPipe() {
  gameState.chickenLane += 1;
  moveChickenLane();
}

function genCar(lane, numCar) {
  const car = document.querySelector(`[lane="${lane}"] [game-class="car-wrapper"]`);
  car.getBoundingClientRect();

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
    //genCar

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
      if (gameState.chickenLane - 1 > 0) {
        // let coin = `
        //   <img class="coin" src="/assets/images/coin.svg" />
        //   `
        // lane.innerHTML += coin;
        const previousLane = document.querySelector(`div.item[game-class="lane"][lane="${gameState.chickenLane - 1}"]`);
        const coin = document.createElement('img');
        coin.setAttribute('src', '/assets/images/coin.svg');
        coin.setAttribute('game-class', 'coin');
        coin.classList.add('coin');
        previousLane.appendChild(coin);
      }
    }

  }
}