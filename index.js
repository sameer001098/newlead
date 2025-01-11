const express = require('express');
const mongoose = require('mongoose');
const registerRoutes = require('./routes/register'); // Adjust the path as necessary
const loginRoutes = require('./routes/login'); // Adjust the path as necessary
const gameRoutes = require('./routes/game');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;


app.use(cors());


app.use(bodyParser.urlencoded({ extended: true }));


app.use(bodyParser.json());


app.use('/api/register', registerRoutes);
app.use('/api/login', loginRoutes); 
app.use('/api/games', gameRoutes);


mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on https://0.0.0.0:${PORT}`);
});

// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

