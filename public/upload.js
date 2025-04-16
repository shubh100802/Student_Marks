document.getElementById('uploadForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const formData = new FormData(this);
  
    try {
      const res = await fetch('/upload-marks', {
        method: 'POST',
        body: formData,
      });
  
      const result = await res.json();
  
      document.getElementById('uploadMessage').innerText = result.message;
      document.getElementById('uploadMessage').style.color = res.ok ? 'green' : 'red';
  
      if (res.ok) {
        this.reset();
      }
    } catch (err) {
      console.error(err);
      document.getElementById('uploadMessage').innerText = 'Upload failed. Try again.';
      document.getElementById('uploadMessage').style.color = 'red';
    }
  });
  