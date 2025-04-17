const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const multer = require('multer');
const XLSX = require('xlsx');
const app = express();
const port = 3000;
require('dotenv').config();


// ==========================
// MONGODB CONNECTION
// ==========================
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log(err));

// ==========================
// MONGOOSE SCHEMA
// ==========================
const FileSchema = new mongoose.Schema({
  filename: String,
  course: String,
  teacher: String,
  slot: String,
  uploadTime: { type: Date, default: Date.now }
});

const File = mongoose.model('File', FileSchema);

const StudentSchema = new mongoose.Schema({
  name: String,
  regNo: String,
  marks: Number,
  course: String,
  teacher: String,
  slot: String
});

const Student = mongoose.model('Student', StudentSchema);

// ==========================
// MIDDLEWARES
// ==========================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.JWT_SECRET || 'some-default-secret',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));


app.get('/search', async (req, res) => {
  const { query, course, teacher, slot } = req.query;

  if (!query || !course || !teacher || !slot) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const student = await Student.findOne({
      $or: [
        { regNo: query },
        { name: new RegExp(query, 'i') }
      ],
      course,
      teacher,
      slot
    });

    if (student) {
      res.json(student);
    } else {
      res.json({});
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// ==========================
// MULTER SETUP FOR FILE UPLOAD
// ==========================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ==========================
// ROUTES
// ==========================

// Teacher login
app.post('/teacher-login', (req, res) => {
  const { username, password } = req.body;

  const validTeachers = [
    { username: "teacher1", password: "1234" },
    { username: "physics", password: "neutron" },
    { username: "shubh", password: "rocket123" },
    { username: "sajjad123", password: "sajjad2025" },
  ];

  const isValid = validTeachers.some(
    teacher => teacher.username === username && teacher.password === password
  );

  if (isValid) {
    req.session.isLoggedIn = true;
    res.redirect('/upload.html');
  } else {
    res.status(401).send("Invalid credentials");
  }
});


// Upload page access
app.get('/upload.html', (req, res) => {
  if (req.session.isLoggedIn) {
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
  } else {
    res.redirect('/teacher-login.html');
  }
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/teacher-login.html');
  });
});

// ==========================
// HANDLE FILE UPLOAD & PARSE EXCEL
// ==========================
app.post('/upload', upload.single('file'), async (req, res) => {
  const { course, teacher, slot } = req.body;

  try {
    // Save uploaded file metadata
    const newFile = new File({
      filename: req.file.filename,
      course,
      teacher,
      slot
    });

    await newFile.save();

    // Parse Excel file
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Store each student
    const studentsToInsert = data.map(row => ({
      name: row.Name || row.name,
      regNo: row.RegNo || row['Reg No'] || row['Registration No'],
      marks: row.Marks || row.Marks || row.Score,
      course,
      teacher,
      slot
    }));

    // Delete existing records for this course + teacher + slot
    await Student.deleteMany({ course, teacher, slot });

    // Insert the new updated students
    await Student.insertMany(studentsToInsert);


    res.send(`<h3>✅ File uploaded and student marks saved! <a href="upload.html">Upload another</a></h3>`);
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Upload failed");
  }
});

// ==========================
// START SERVER
// ==========================
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
