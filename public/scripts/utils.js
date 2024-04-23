function handleBetInput(event) {
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
    if (i === number) {
      pipe.setAttribute("active", "true");
      pipe.addEventListener("click", moveToNextPipe);
      mulText.setAttribute("active", "true");
      mulText.addEventListener("click", moveToNextPipe);
    } else {
      pipe.removeAttribute("active");
      pipe.removeEventListener("click", moveToNextPipe);
      mulText.removeAttribute("active");
      mulText.removeEventListener("click", moveToNextPipe);
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
    const data = await response.json();
    userState.balance = data.balance;
    userState.username = data.username;
    userState.loggedIn = true;
    document.querySelector(
      `header div.user-action div[login="true"] p#username`,
    ).innerText = userState.username;
    document.querySelector(
      `header div.user-action div[login="true"] p#balance`,
    ).innerText = userState.balance;
    document.querySelector(
      `header div.user-action div[login="true"]`,
    ).style.display = "flex";
    document.querySelector(
      `header div.user-action div[login="false"]`,
    ).style.display = "true";
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
    gameState = data.gameState;
    objectState = data.objectState;
    setLevel(gameState.level);
    setActiveLane(gameState.chickenLane + 1);
    transformXGameView();
  }
}

async function handleMoveBet() {
  const response = await fetch("/api/game/spin", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(await response.json());
}

async function handleStartBet() {
  const bet = document.getElementById("bet").value;
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
  if (response.status === 400) {
    alert(data.error);
    return;
  } else if (response.status === 401) {
    window.location.replace("/login");
    return;
  }

  const startBetButton = document.getElementById("btn-start");
  startBetButton.style.display = "none";
  const stopBetButton = document.getElementById("btn-stop");
  stopBetButton.style.display = "block";
  gameState.isPlaying = true;
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

  const startBetButton = document.getElementById("btn-start");
  startBetButton.style.display = "block";
  const stopBetButton = document.getElementById("btn-stop");
  stopBetButton.style.display = "none";
  gameState.isPlaying = false;
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