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
