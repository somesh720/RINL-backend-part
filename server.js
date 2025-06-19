const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

mongoose.connect('mongodb://localhost:27017/rinl', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  mobile: String
});

const SuggestionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  empName: String,
  empID: String,
  department: String,
  suggestion: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Suggestion = mongoose.model('Suggestion', SuggestionSchema);

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email: email.toLowerCase(), passwordHash, mobile });

    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// server.js or routes file

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    return res.status(200).json({ success: true, userId: user._id });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});




app.post('/api/suggestion', async (req, res) => {
  try {
    const { userId, empName, empID, department, suggestion } = req.body;
    if (!userId) return res.status(401).json({ error: 'User not authenticated' });

    await Suggestion.create({ userId, empName, empID, department, suggestion });
    res.json({ success: true });
  } catch (err) {
    console.error("Suggestion error:", err);
    res.status(500).json({ error: 'Error submitting suggestion' });
  }
});

app.get('/api/suggestions/:userId', async (req, res) => {
  const suggestions = await Suggestion.find({ userId: req.params.userId });
  res.json(suggestions);
});

app.get('/api/all-suggestions', async (req, res) => {
  try {
    const suggestions = await Suggestion.find({});
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Error fetching suggestions' });
  }
});


app.get('/', (req, res) => {
  res.send('Server is running...');
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
