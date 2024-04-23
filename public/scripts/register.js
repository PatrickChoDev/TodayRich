
function alert(message) {
  const alertElement = document.getElementById('error-message');
  alertElement.innerHTML = message;
  console.log(message)
  alertElement.style.display = 'block';
}

async function handleFormSubmit() {

  // Get form elements
  const form = document.getElementById('register-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');

  // Retrieve values from form inputs
  const username = usernameInput.value;
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Perform validation
  if (username.trim() === '') {
      alert('Please enter a username');
      return;
  }

  if (password.trim() === '') {
      alert('Please enter a password');
      return;
  }

  if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
  }

  try {
    // Send POST request to /register endpoint
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });


    responseJSON = await response.json()

    console.log(responseJSON)

    if (responseJSON.success) {
      // Redirect to login page
        console.log(responseJSON)
        window.location.replace('/game');
    } 
  } catch (error) {
    alert(error);
  }
}