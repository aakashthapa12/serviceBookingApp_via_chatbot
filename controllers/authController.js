// // controllers/authController.js
// const User = require('../models/User');
// const bcrypt = require('bcryptjs');

// exports.getSignup = (req, res) => {
//     res.render('signup');
// };

// exports.postSignup = async (req, res) => {
//     const { email, password, role, /* other fields */ } = req.body;
//     console.log(email);
//     console.log(password);
//     console.log(role);
//     try {
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).send('User already exists');
//         }

//         // Create a new user document
//         const hashedPassword = await bcrypt.hash(password, 12);
//         const user = new User({
//             email,
//             password: hashedPassword,
//             role,
//             // Add other fields here
//         });

//         // Save the user document to the database
//         await user.save();

//         console.log(email);
//     console.log(hashedPassword);
//     console.log(role);
//     console.log(user);

//         // Redirect or send success response
//         return res.redirect('/auth/login');
//         // res.status(200).send('Signup successful');
//     } catch (err) {
//         console.error('Signup error:', err);
//         return res.status(500).send('Server error');
//     }
// };


// exports.getLogin = (req, res) => {
//     res.render('login');
// };



// exports.postLogin = async (req, res) => {
//     const { email, password, role } = req.body;
//     try{
//         const user = await User.findOne({ email });

//         if (!user || !(await bcrypt.compare(password, user.password))) {
//              return res.status(400).send('Invalid email or password');
//         }

//         // console.log(user.role);
//         // console.log(role);
//         if(role !== user.role){
//             return res.status(400).send('Invalid role');
//         }

//         if (role === 'provider') {
//             res.redirect('/service-provider/service-provider-page');
//         } else if (role === 'client') {
//             res.render('client_Index');
//         } else {
//             // Handle invalid roles
//             res.status(400).send('Invalid role');
//         }
//     } catch (err) {
//         console.error('Login error:', err);
//         res.status(500).send('Server error');
//     }

// };









// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Render the signup page
exports.getSignup = (req, res) => {
    res.render('signup');
};

// Handle signup form submission
exports.postSignup = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create a new user document
        const user = new User({
            email,
            password: hashedPassword,
            role,
        });

        // Save the user document to the database
        await user.save();

        // Redirect to the login page after successful signup
        return res.redirect('/auth/login');
    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).send('Server error');
    }
};

// Render the login page
exports.getLogin = (req, res) => {
    res.render('login');
};

// Handle login form submission
exports.postLogin = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        // Find the user by email
        const user = await User.findOne({ email });

        // Check if the user exists and the password is correct
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send('Invalid email or password');
        }

        // Check if the role matches
        if (role !== user.role) {
            return res.status(400).send('Invalid role');
        }

        // Redirect based on the user's role
        if (role === 'provider') {
            res.redirect('/service-provider/service-provider-page');
        } else if (role === 'client') {
            res.render('client_Index');
        } else {
            res.status(400).send('Invalid role');
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send('Server error');
    }
};


