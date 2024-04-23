document.addEventListener("DOMContentLoaded", async function () {
  if (window.location.pathname != "/login")
    window.location.replace("/login");
  const response = await fetch("/api/me");
  if (response.ok) {
    window.location.replace("/game");
  }
  const input = document.getElementById("username");
  input.focus();
  const form = document.querySelector("form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const username = formData.get("username");
    const password = formData.get("password");
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      alert("Login successful");
      window.location.replace("/game");
    } else {
      const { error } = await response.json();
      document.getElementById("error-message").innerText = error;
    }
  });
});