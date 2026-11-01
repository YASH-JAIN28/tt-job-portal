import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;

if (!mongoUri || !jwtSecret) {
  console.error('Missing MONGODB_URI or JWT_SECRET in .env');
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

app.use(cors());
app.use(express.json());

const createToken = (user) => jwt.sign({ userId: user._id.toString() }, jwtSecret, { expiresIn: '7d' });
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email });

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok' });
});

app.post('/api/auth/register', async (request, response) => {
  try {
    const { name, email, password } = request.body;
    if (!name || !email || !password || password.length < 6) {
      return response.status(400).json({ message: 'Name, email, and a password of at least 6 characters are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return response.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: normalizedEmail, passwordHash });
    return response.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    console.error('Registration failed:', error);
    return response.status(500).json({ message: 'Unable to create the account.' });
  }
});

app.post('/api/auth/login', async (request, response) => {
  try {
    const { email, password } = request.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
      return response.status(401).json({ message: 'Incorrect email or password.' });
    }

    return response.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    console.error('Login failed:', error);
    return response.status(500).json({ message: 'Unable to sign in.' });
  }
});

mongoose.connect(mongoUri)
  .then(() => {
    app.listen(port, () => console.log(`Authentication API running on http://localhost:${port}`));
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
