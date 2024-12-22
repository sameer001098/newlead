const express = require('express');
const router = express.Router();
const Register = require('../schemas/register');

const multer = require('multer');
const upload = multer();
          
router.use(express.urlencoded({ extended: true }));
router.use(express.json());


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

// Update a specific user by ID
router.put('/:id', async (req, res) => {
    try {
        const user = await Register.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
