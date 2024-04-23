let gameState = {
  chickenLane: 0,
}

function moveChickenLane() {
  gameState.chickenLane = (gameState.chickenLane + 1)
  console.log(gameState.chickenLane)
}