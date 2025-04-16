document.getElementById('loginForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('/teacher-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        username,
        password
      })
    });

    if (res.redirected) {
      // Successful login, redirect to upload.html
      window.location.href = res.url;
    } else {
      // Show error message
      document.getElementById('errorMessage').textContent = "Invalid username or password. Please try again.";
    }

  } catch (err) {
    console.error('Login error:', err);
    document.getElementById('errorMessage').textContent = "Something went wrong. Try again.";
  }
});
