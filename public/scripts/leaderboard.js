let current = 0;
const leaderboard = document.getElementById('leaderboard');
const leaderboardContent = document.getElementById('leaderboard-content');
const personal = document.getElementById('personal');


async function getLeaderboard(type) {
  if (type !== "bestScore" && type !== "money") return;

  const response = await fetch('/api/leaderboard/' + type);
  const data = await response.json();
  return data;
}

async function displayLeaderboard(type) {
  clearLeaderboard();

  const data = await getLeaderboard(type);
  // leaderboard.textContent = type;

  document.getElementById('title-container').innerText = "Leaderboard - " + (type == "bestScore" ? "Best Score" : "Money");

  for (const e of data.leaderboard) {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    const scoreCell = document.createElement('td');

    nameCell.textContent = e.name;
    scoreCell.textContent = e[type];

    row.appendChild(nameCell);
    row.appendChild(scoreCell);

    leaderboardContent.appendChild(row);
  }

  try {
    const user = await fetch('/api/me');
    const userData = await user.json();

    const userRow = document.createElement('tr');
    const userNameCell = document.createElement('td');
    const userScoreCell = document.createElement('td');

    userNameCell.textContent = userData.data.name;
    userScoreCell.textContent = userData.data[type];

    userRow.appendChild(userNameCell);
    userRow.appendChild(userScoreCell);

    personal.appendChild(userRow);
  } catch (error) {
    console.log(error);
  }
}

function clearLeaderboard() {
  while (leaderboardContent.firstChild) {
    leaderboardContent.removeChild(leaderboardContent.firstChild);
  }
  while (personal.firstChild) {
    personal.removeChild(personal.firstChild);
  }
}

function changeLeaderboard() {
  const totalState = 2;

  if (current % totalState === 0) {
    displayLeaderboard('bestScore');
    current++;
  } else if (current % totalState === 1) {
    displayLeaderboard('money');
    current++;
  }
  if (current === totalState) {
    current = 0;
  }
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
  displayLeaderboard('bestScore');
  setInterval(() => {
    displayLeaderboard('bestScore');
    loadProfile();
  }, 10000);
});