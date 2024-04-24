function handleBetInput(event) {
  if (gameState.isPlaying) return;
  if (event.key === "-" || event.key === "+" || event.key === "e") {
    event.preventDefault();
  }

  if (event.key === "." && event.target.value.includes(".")) {
    event.preventDefault();
  }

  if (event.key === "Enter") {
    console.log("Enter pressed");
  }
}

function mouseOverPipe() {
  this.style.opacity = 1;
}

function mouseLeavePipe() {
  this.style.opacity = 0.5;
}

function setActiveLane(number) {
  for (let i = 1; i <= 15; i++) {
    const pipe = document.querySelector(`[lane="${i}"] [game-class="pipe"]`);
    const mulText = document.querySelector(
      `[lane="${i}"] [game-class="mul-text"]`,
    );
    const car = document.querySelector(`[lane="${i}"] [game-class="car-wrapper"]`);
    if (i === number) {
      pipe.setAttribute("active", "true");
      pipe.addEventListener("click", moveToNextPipe);
      mulText.setAttribute("active", "true");
      mulText.addEventListener("click", moveToNextPipe);
      car.style.display = "none";
    } else {
      pipe.removeAttribute("active");
      pipe.removeEventListener("click", moveToNextPipe);
      mulText.removeAttribute("active");
      mulText.removeEventListener("click", moveToNextPipe);
      if (i > number) car.style.display = "flex";
    }
  }
}

function adjustViewTransform(amount) {
  const x = getComputedStyle(document.getElementById("view"));
  const old = x.getPropertyValue("--viewTransform");
  document
    .getElementById("view")
    .style.setProperty(
      "--viewTransform",
      `${parseFloat(old.split("px")[0] || 0) + amount}px`,
    );
}

function setViewTransform(amount) {
  document
    .getElementById("view")
    .style.setProperty("--viewTransform", `${amount}px`);
}

function getViewTransform() {
  const x = getComputedStyle(document.getElementById("view"));
  return parseFloat(x.getPropertyValue("--viewTransform").split("px")[0] || 0);
}

function transformXGameView() {
  const chicken = document.getElementById("chicken");
  if (!chicken) return;
  const gameContainer = document.getElementById("game-container");
  const gameView = document.getElementById("view");
  setTimeout(() => {
    if (
      chicken.getBoundingClientRect().x >=
      gameContainer.getBoundingClientRect().width / 4
    ) {
      adjustViewTransform(
        -150 -
        Math.max(
          0,
          chicken.getBoundingClientRect().x -
          gameContainer.getBoundingClientRect().width / 4 -
          150,
        ),
      );
      setViewTransform(Math.min(0, getViewTransform()));
      gameView.style.transform = `translateX(${Math.max(gameContainer.getBoundingClientRect().width - gameView.getBoundingClientRect().width, getViewTransform())}px)`;
    } else if (chicken.getBoundingClientRect().x < 0) {
      console.log("refine to", chicken.getBoundingClientRect().x);
      adjustViewTransform(-chicken.getBoundingClientRect().x);
      setViewTransform(Math.min(0, getViewTransform()));
      gameView.style.transform = `translateX(${Math.max(gameContainer.getBoundingClientRect().width - gameView.getBoundingClientRect().width, getViewTransform())}px)`;
    }
  }, 350); // 300ms is the time it takes for the chicken to move to the next lane + 50 ms for refinement / js delay
}

function handleLevelChange(element) {
  if (gameState.isPlaying) return;
  const level = element.getAttribute("value");
  gameState.level = level;
  setLevel(level);
}

function setLevel(level) {
  if (level === "easy") {
    gameState.carScreenTime = 1000;
    gameState.carGenerationTime = 400;
    gameState.carFrequency = 0.95;
  } else if (level === "medium") {
    gameState.carScreenTime = 800;
    gameState.carGenerationTime = 300;
    gameState.carFrequency = 0.9;
  } else if (level === "hard") {
    gameState.carScreenTime = 600;
    gameState.carGenerationTime = 200;
    gameState.carFrequency = 0.85;
  } else if (level === "daredevil") {
    gameState.carScreenTime = 600;
    gameState.carGenerationTime = 100;
    gameState.carFrequency = 0.7;
  }
  updateMultiplier();

  document.querySelectorAll("#btn-bet").forEach((e) => {
    if (e.getAttribute("value") !== level) e.removeAttribute("selected");
    else e.setAttribute("selected", "true");
  });
}

async function loadProfile() {
  const response = await fetch("/api/me", {
    method: "GET",
    credentials: "same-origin",
  });
  if (response.status === 200) {
    const { data } = await response.json();
    userState.balance = data.money.toFixed(2);
    userState.username = data.name;
    userState.loggedIn = true;
    document.querySelector(
      `header div.user-action div[login="true"] p#username`,
    ).innerText = userState.username;
    document.querySelector(
      `header div.user-action div[login="true"] p#balance`,
    ).innerText = `$ ${userState.balance}`;
    document.querySelector(
      `header div.user-action div[login="true"]`,
    ).style.display = "flex";
    document.querySelector(
      `header div.user-action div[login="false"]`,
    ).style.display = "none";
  } else {
    userState.loggedIn = false;
    document.querySelector(
      `header div.user-action div[login="false"]`,
    ).style.display = "flex";
    document.querySelector(
      `header div.user-action div[login="true"]`,
    ).style.display = "none";
  }
}

async function loadGame() {
  const response = await fetch("/api/game", {
    method: "GET",
    credentials: "same-origin",
  });
  if (response.status === 200) {
    const data = await response.json();
    gameState.level = data.level;
    gameState.chickenLane = data.step;
    document.getElementById('bet-amount').value = data.bet;
    gameState.bet = data.bet;
    setLevel(gameState.level);
    setActiveLane(gameState.chickenLane + 1);
    moveChickenLane();
    transformXGameView();
    updateUIButton();
    for (var i = 1; i <= gameState.chickenLane; i++) {
      const lane = document.querySelector(
        `div.item[game-class="lane"][lane="${i}"]`,
      );
      lane.querySelector(`[game-class="pipe"]`).style.display = "none";
      lane.querySelector(`[game-class="mul-text"]`).style.display = "none";
      if (lane) {
        const blockerCrack = document.createElement("img");
        blockerCrack.setAttribute("src", "/assets/images/roadBlock-crack.svg");
        blockerCrack.setAttribute("game-class", "blocker-crack");
        lane.appendChild(blockerCrack);
        const blocker = document.createElement("img");
        blocker.setAttribute("src", "/assets/images/roadBlock.svg");
        blocker.setAttribute("game-class", "blocker");
        lane.appendChild(blocker);
        blockerCrack.animate(
          [
            { transform: "translateY(-55px)" },
            { transform: "translateY(-60px)" },
          ],
          {
            duration: 200,
            delay: 100,
            iterations: 1,
            fill: "forwards",
          },
        );
        blocker.animate(
          [
            { transform: `translateY(-${lane.getBoundingClientRect().y}px)` },
            { transform: "translateY(-70px)" },
          ],
          {
            duration: 200,
            iterations: 1,
            fill: "forwards",
          },
        );
        gameState.isWaiting = false;
      }
    }
    if (gameState.chickenLane - 1 > 0) {
      const previousLane = document.querySelector(
        `div.item[game-class="lane"][lane="${gameState.chickenLane - 1}"]`,
      );
      const coin = document.createElement("img");
      coin.setAttribute("src", "/assets/images/coin.svg");
      coin.setAttribute("game-class", "coin");
      coin.classList.add("coin");
      previousLane.appendChild(coin);
    }
    gameState.isPlaying = true;
  }
  updateUIButton();
}


async function handleStartBet() {
  const bet = document.getElementById("bet-amount").value;
  if (parseFloat(bet) <= 0) {
    alert("Please enter a valid bet amount");
    return;
  }
  const response = await fetch("/api/game/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bet: parseFloat(bet), level: gameState.level }),
  });

  const data = await response.json();
  console.log(data)
  if (response.ok) {
    window.location.reload();
  }
  else if (response.status === 400) {
    alert(data.error);
    return;
  } else if (response.status === 401) {
    window.location.replace("/login");
    return;
  }
}

async function handleMoveBet() {
  setTimeout(() => {
    const response = fetch("/api/game/play", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    response.then((data) => {
      data.json().then((data) => {
        if (data.game.ended) {
          setDead(true);
          gameState.isPlaying = false;
          updateUIButton();
        } else {
          setDead(false);
          gameState.isPlaying = true;
          setActiveLane(gameState.chickenLane + 1);
        }
        gameState.isWaiting = false;
      });
    });
  }, 400);
}

async function handleStopBet() {
  const response = await fetch("/api/game/stop", { method: "POST" });
  const data = await response.json();
  if (response.status === 400) {
    alert(data.error);
    return;
  } else if (response.status === 401) {
    window.location.replace("/login");
    return;
  }
  gameState.isPlaying = false;
  updateUIButton()
  alert(`You earned $${data.earn.toFixed(2)}`)
  loadProfile();
}

async function handleLogout() {
  const response = await fetch("/api/logout", {
    method: "GET",
    credentials: "same-origin",
  });
  if (response.status === 200) {
    location.reload();
  } else {
    alert("Failed to logout");
  }
}

function updateUIButton() {
  const startBetButton = document.getElementById("btn-start");
  const stopBetButton = document.getElementById("btn-stop");
  if (gameState.isPlaying) {
    startBetButton.style.display = "none";
    stopBetButton.style.display = "block";
  } else {
    startBetButton.style.display = "block";
    stopBetButton.style.display = "none";
  }
}

async function updateMultiplier() {
  const response = fetch(`/api/game/multiplier/${gameState.level}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const multiplier = (await (await response).json()).multiplier;
  for (var i = 1; i <= 15; i++) {
    const mulText = document.querySelector(
      `[lane="${i}"] [game-class="mul-text"]`,
    );
    mulText.innerText = `x${(1 + i * multiplier).toFixed(2)}`;
  }
}

function genCar(lane, numCar) {
  const car = document.querySelector(
    `[lane="${lane}"] [game-class="car-wrapper"]`,
  );
  car.style.display = "flex";
  const newCarImage = document.createElement("img");
  newCarImage.setAttribute("src", `/assets/cars/car${numCar}.svg`);
  newCarImage.setAttribute("game-class", "car");
  car.appendChild(newCarImage);
  newCarImage.animate(
    [
      { transform: `translateY(${-car.getBoundingClientRect().height}px)` },
      { transform: `translateY(${car.getBoundingClientRect().height}px)` },
    ],
    {
      duration: gameState.carScreenTime,
      iterations: 1,
      fill: "forwards",
    },
  );
  setTimeout(() => {
    newCarImage.remove();
  }, gameState.carScreenTime);
}