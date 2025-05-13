const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// [SECTION] Routes
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');

const app = express();

mongoose.connect(process.env.MONGODB_STRING);

mongoose.connection.once('open', () =>
  console.log('Now connected to MongoDB Atlas')
);

const corsOptions = {
  origin: [
    'http://localhost:8000',
    'http://localhost:3000',
    'https://blog-app-client-plum.vercel.app',
    'https://blog-app-client-3fjisnzxy-julius-albert-grajos-projects.vercel.app',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use('/users', userRoutes);
app.use('/posts', postRoutes);

if (require.main === module) {
  app.listen(process.env.PORT, () =>
    console.log(`API is now online on port ${process.env.PORT}`)
  );
}

module.exports = { app, mongoose };
