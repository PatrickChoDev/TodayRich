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
    const mulText = document.querySelector(`[lane="${i}"] [game-class="mul-text"]`);
    if (i === number) {
      pipe.setAttribute('active', 'true');
      pipe.addEventListener("click", moveToNextPipe);
      mulText.setAttribute('active', 'true');
      mulText.addEventListener("click", moveToNextPipe);
    } else {
      pipe.removeAttribute('active');
      pipe.removeEventListener("click", moveToNextPipe);
      mulText.removeAttribute('active');
      mulText.removeEventListener("click", moveToNextPipe);
    }
  }
}


function adjustViewTransform(amount) {
  const x = getComputedStyle(document.getElementById("view"))
  const old = x.getPropertyValue("--viewTransform");
  document.getElementById("view").style.setProperty("--viewTransform", `${parseFloat(old.split("px")[0] || 0) + amount}px`);
}

function setViewTransform(amount) {
  document.getElementById("view").style.setProperty("--viewTransform", `${amount}px`);
}

function getViewTransform() {
  const x = getComputedStyle(document.getElementById("view"))
  return parseFloat(x.getPropertyValue("--viewTransform").split("px")[0] || 0);
}

function transformXGameView() {
  const chicken = document.getElementById("chicken")
  if (!chicken) return;
  const gameContainer = document.getElementById("game-container");
  const gameView = document.getElementById("view");
  setTimeout(() => {
    if (chicken.getBoundingClientRect().x >= gameContainer.getBoundingClientRect().width / 4) {
      adjustViewTransform(-150 - Math.max(0, chicken.getBoundingClientRect().x - gameContainer.getBoundingClientRect().width / 4 - 150));
      setViewTransform(Math.min(0, getViewTransform()));
      gameView.style.transform = `translateX(${Math.max(gameContainer.getBoundingClientRect().width - gameView.getBoundingClientRect().width, getViewTransform())}px)`;
    } else if (chicken.getBoundingClientRect().x < 0) {
      console.log("refine to", chicken.getBoundingClientRect().x)
      adjustViewTransform(-chicken.getBoundingClientRect().x);
      setViewTransform(Math.min(0, getViewTransform()));
      gameView.style.transform = `translateX(${Math.max(gameContainer.getBoundingClientRect().width - gameView.getBoundingClientRect().width, getViewTransform())}px)`;
    }
  }, 350) // 300ms is the time it takes for the chicken to move to the next lane + 50 ms for refinement / js delay
}