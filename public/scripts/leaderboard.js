const board = document.getElementById('board-score');
const personal = document.getElementById('personal-score');
var boardType = "bestScore";

async function getLeaderboard(type) {
  if (type !== "bestScore" && type !== "money") return;
  const response = await fetch('/api/leaderboard/' + type);
  const data = await response.json();
  return data;
}

async function displayLeaderboard(type) {

  const data = await getLeaderboard(type);
  clearLeaderboard();

  for (const e of data.leaderboard) {
    const row = document.createElement('div');
    const nameCell = document.createElement('div');
    nameCell.className = 'namecell';
    const scoreCell = document.createElement('div');
    scoreCell.className = 'scorecell';

    nameCell.textContent = e.name;
    scoreCell.textContent = e[type].toFixed(2);

    row.appendChild(nameCell);
    row.appendChild(scoreCell);
    row.classList.add('board-row')

    board.appendChild(row);
  }
}

function clearLeaderboard() {
  board.replaceChildren();
}

function changeLeaderboard() {
  if (boardType === "bestScore") {
    boardType = "money";
  }
  else {
    boardType = "bestScore";
  }
  if (boardType === 'bestScore') {
    document.querySelector('[best-score="true"]').style.display = 'block';
    document.querySelector('[money="true"]').style.display = 'none';
  } else {
    document.querySelector('[best-score="true"]').style.display = 'none';
    document.querySelector('[money="true"]').style.display = 'block';
  }
  displayLeaderboard(boardType);
}


async function loadProfile() {
  const response = await fetch("/api/me", {
    method: "GET",
    credentials: "same-origin",
  });
  if (response.status === 200) {
    const { data } = await response.json();
    document.querySelector(
      `header div.user-action div[login="true"] p#username`,
    ).innerText = data.name;
    document.querySelector(
      `header div.user-action div[login="true"] p#balance`,
    ).innerText = `$ ${data.money.toFixed(2)}`;
    document.querySelector(
      `header div.user-action div[login="true"]`,
    ).style.display = "flex";
    document.querySelector(
      `header div.user-action div[login="false"]`,
    ).style.display = "none";

    personal.replaceChildren();

    const personalName = document.createElement('div');
    personalName.classList.add('namecell');
    personalName.classList.add('personalcell')
    personalName.textContent = data.name;
    personal.appendChild(personalName);

    const personalScore = document.createElement('div');
    personalScore.classList.add('scorecell');
    personalScore.classList.add('personalcell')
    personalScore.textContent = data[boardType].toFixed(2);
    personal.appendChild(personalScore);

  } else {
    document.querySelector(
      `header div.user-action div[login="false"]`,
    ).style.display = "flex";
    document.querySelector(
      `header div.user-action div[login="true"]`,
    ).style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadProfile();
  displayLeaderboard(boardType);
  setInterval(() => {
    displayLeaderboard(boardType);
    loadProfile();
  }, 10000);
});