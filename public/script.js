// 🔍 Updated Search Handler
async function searchResult() {
  const query = document.getElementById('searchInput').value.trim();
  const course = document.getElementById('courseSelect').value;
  const teacher = document.getElementById('teacherSelect').value;

  if (!query || !course || !teacher) {
    alert("Please fill all fields (Name/Reg No, Course, Teacher)");
    return;
  }

  try {
    const slot = document.getElementById("slot").value;
    const res = await fetch(`/search?query=${encodeURIComponent(query)}&course=${encodeURIComponent(course)}&teacher=${encodeURIComponent(teacher)}&slot=${encodeURIComponent(slot)}`);

    const data = await res.json();

    const resultDiv = document.getElementById('resultDisplay');
    if (data && data.name) {
      resultDiv.innerHTML = `
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Registration No:</strong> ${data.regNo}</p>
          <p><strong>Course:</strong> ${data.course}</p>
          <p><strong>Teacher:</strong> ${data.teacher}</p>
          <p><strong>Marks:</strong> ${data.marks}</p>
        `;
    } else {
      resultDiv.innerHTML = `<p style="color:red;">No result found.</p>`;
    }
  } catch (err) {
    console.error(err);
    document.getElementById('resultDisplay').innerHTML = `<p style="color:red;">Error fetching result</p>`;
  }
}
