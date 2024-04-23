document.addEventListener("DOMContentLoaded", async function () {
  if (window.location.pathname != "/register")
    window.location.replace("/register");
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
    const confirmPassword = formData.get("confirm-password");
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      alert("Account created successfully");
      window.location.replace("/game");
    } else {
      const { error } = await response.json();
      alert(error);
    }
  });
});
