const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Register = require('../schemas/register');
// const bcrypt = require('bcryptjs'); 
const multer = require('multer');
const upload = multer();
          
router.use(express.urlencoded({ extended: true }));
router.use(express.json());


// Get all users from the Register collection
router.get('/', async (req, res) => {
    try {
        // Retrieve all users from the database
        const users = await Register.find();
        
        // Check if users exist
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        // Return the list of users
        res.json(users);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/loginadmin', async (req, res) => {
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

        // Compare the provided password with the stored password (plaintext)
        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid password.' });
        }

        // Check if the user has the role 'superadmin'
        if (user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Unauthorized. You are not a superadmin.' });
        }

        // Return success message and user data
        res.json({
            message: 'Login successful.',
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});




router.post('/', upload.none(), async (req, res) => {
    console.log(req.body);
    try {
        const { fullname, email, phone, password, role } = req.body;

        // Validate that all fields are provided
        if (!fullname || !email || !phone || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }

        // Check if the email already exists in the database
        const existingUser = await Register.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists.' });
        }

        // Create and save the new user
        const newUser = new Register({ fullname, email, phone, password, role });
        await newUser.save();

        // Return the user data including the MongoDB _id (which is the user ID)
        res.status(201).json({
            message: 'User data inserted successfully.',
            user: {
                id: newUser._id,  // Include the _id as 'id' in the response
                fullname: newUser.fullname,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
            }
        });
    } catch (error) {
        // Handle any errors
        res.status(400).json({ message: error.message });
    }
});
// Get a specific user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await Register.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.post('/', upload.none(), async (req, res) => {
    console.log(req.body);
    try {
        const { fullname, email, phone, password, role } = req.body;

        // Validate that all fields are provided
        if (!fullname || !email || !phone || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }

        // Check if the email already exists in the database
        const existingUser = await Register.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists.' });
        }

        // Create and save the new user
        const newUser = new Register({ fullname, email, phone, password, role });
        await newUser.save();

        // Return the user data including the MongoDB _id (which is the user ID)
        res.status(201).json({
            message: 'User data inserted successfully.',
            user: {
                id: newUser._id,  // Include the _id as 'id' in the response
                fullname: newUser.fullname,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
            }
        });
    } catch (error) {
        // Handle any errors
        res.status(400).json({ message: error.message });
    }
});
// Update a specific user by ID (id will be passed via form-data)
router.put('/update', upload.none(), async (req, res) => {
    console.log(req.body); // Log the request body to check if the data is correct

    try {
        // Extract data from the request body
        const { id, fullname, email, phone, password } = req.body;

        // Validate that the ID is provided
        if (!id) {
            return res.status(400).json({ message: 'ID is required' });
        }

        // Validate the required fields
        if (!fullname || !email || !phone || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }

        // Check if the provided `id` is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        // Find the user by ID
        const user = await Register.findById(id);

        // If no user is found with the provided ID
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the new email is already taken (if it has changed)
        if (email !== user.email) {
            const existingUser = await Register.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists.' });
            }
        }

        // Update the user data
        user.fullname = fullname;
        user.email = email;
        user.phone = phone;
        user.password = password;

        // Save the updated user
        await user.save();

        // Respond with the updated user data
        res.status(200).json({
            message: 'User data updated successfully.',
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                role: user.role,
            }
        });
    } catch (error) {
        // Handle any errors that occurred
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;


module.exports = router;
