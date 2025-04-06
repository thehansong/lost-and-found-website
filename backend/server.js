require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

mongoose.connect('mongodb+srv://admin:testing123@cluster0.ygxrdeu.mongodb.net/lostAndFound?retryWrites=true&w=majority&appName=Cluster0');

// Lost and found item model
const Item = mongoose.model('Item', {
  title: String,
  description: String,
  location: String,
  image: String,
  category: String
});

// User model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
  }
  next();
});

const User = mongoose.model('User', userSchema);

// Register route
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create a new user and save
  const user = new User({ email, password });
  await user.save();

  res.status(201).json({ message: 'User registered successfully' });
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ message: 'Login successful', token });
});

// DELETE endpoint to claim an item by its _id
app.delete('/api/items/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const deletedItem = await Item.findByIdAndDelete(itemId);

    if (!deletedItem) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    res.status(200).json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting item" });
  }
});

// Claim Item
app.put('/api/items/:id/claim', async (req, res) => {
  try {
    const itemId = req.params.id;

    // Ensure the itemId is valid (not a malformed ObjectId)
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, message: "Invalid item ID" });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      { category: 'found' },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    res.status(200).json({ success: true, message: "Item claimed successfully", item: updatedItem });
  } catch (error) {
    console.error("Error claiming item:", error);
    res.status(500).json({ success: false, message: "Error claiming item" });
  }
});

// Item routes
app.get('/api/items', async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

app.post('/api/items', async (req, res) => {
  const item = new Item(req.body);
  await item.save();
  res.status(201).json(item);
});

app.get('/api/items/search', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  const items = await Item.find({
    $or: [
      { title: new RegExp(query, 'i') },
      { description: new RegExp(query, 'i') },
      { location: new RegExp(query, 'i') },
      { category: new RegExp(query, 'i') }
    ]
  });

  res.json(items);
});

app.listen(3000, () => console.log('Server running on port 3000'));
