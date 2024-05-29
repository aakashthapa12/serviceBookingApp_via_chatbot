// // app.js
// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const multer = require('multer'); 

// const authRoutes = require('./routes/auth');
// const serviceProviderRoutes = require('./routes/serviceProvider'); 
// const clientRoutes = require('./routes/client'); 
// const chatbotRouter = require('./routes/chatbot'); //new
// const path = require('path');
// require('dotenv').config();

// const app = express();

// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log('MongoDB connected'))
//     .catch(err => console.error('MongoDB connection error:', err)); // Improve error handling

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.json());
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// app.use(express.static(path.join(__dirname, "public")));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// // Routes
// app.use('/auth', authRoutes);
// app.use('/service-provider', serviceProviderRoutes); 
// app.use('/client', clientRoutes); 
// app.use('/chatbot', chatbotRouter);


// // Default Route
// app.get('/', (req, res) => {
//     res.render('home.ejs'); // Render the login page by default
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error('Error:', err);
//     res.status(500).send('Something went wrong!');
//     next(err); // Pass the error to the next middleware
// });


// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));





const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer'); 

const authRoutes = require('./routes/auth');
const serviceProviderRoutes = require('./routes/serviceProvider'); 
const clientRoutes = require('./routes/client'); 
const chatbotRouter = require('./routes/chatbot'); //new
const path = require('path');
require('dotenv').config();

const app = express();

// Set Mongoose to use the native Node.js promise library
mongoose.Promise = global.Promise;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err)); // Improved error handling

// Mongoose configuration to prevent buffering issues
mongoose.set('bufferCommands', false);

// Optional: Enable Mongoose debugging (for development purposes)
if (process.env.NODE_ENV === 'development') {
    mongoose.set('debug', true);
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/auth', authRoutes);
app.use('/service-provider', serviceProviderRoutes); 
app.use('/client', clientRoutes); 
app.use('/chatbot', chatbotRouter);

// Default Route
app.get('/', (req, res) => {
    res.render('home.ejs'); // Render the login page by default
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Something went wrong!');
    // Do not call next(err) here as it can cause the error to be sent multiple times
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
