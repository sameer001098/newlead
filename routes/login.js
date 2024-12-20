const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer();
const Register = require('../schemas/register');


// Login user
router.post('/', upload.none(), async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate that email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Find the user by email
        const user = await Register.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check the password (compare directly)
        if (password !== user.password) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Login successful, return a success message and the user data (excluding sensitive information)
        res.status(200).json({
            message: 'Login successful!',
            user: {
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        // Handle any errors that occur during the process
        res.status(400).json({ message: error.message });
    }
});

router.post('/superadmin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate that email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Find the user by email
        const user = await Register.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check the password (compare directly)
        if (password !== user.password) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Check if the user has the role of 'superadmin'
        if (user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Access denied. Superadmin role required.' });
        }

        // Login successful, return user data
        res.status(200).json({ message: 'Login successful!', user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
