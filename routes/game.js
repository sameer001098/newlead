const express = require('express');
const router = express.Router();
const Game = require('../schemas/game');
const mongoose = require('mongoose');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Set the upload directory
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Set the filename of the uploaded file
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });
// const upload = multer();  




// Insert a new game record
// router.post('/', upload.none(), async (req, res) => {
//     try {
//         const { username, userid, magicnumber, attempts } = req.body;

//         // Validate input
//         if (!username || !userid || !magicnumber) {
//             return res.status(400).json({ message: 'Username, User ID, and Magic Number are required.' });
//         }

//         // Validate that magicnumber is a 5-digit number
//         if (!/^\d{5}$/.test(magicnumber)) {
//             return res.status(400).json({ message: 'Magic Number must be exactly 5 digits.' });
//         }

//         // Ensure attempts is static and always set to 5
//         const fixedAttempts = 5;

//         // Create a new game entry
//         const newGame = new Game({
//             username,
//             userid,  // Store userid as a simple string (no need for ObjectId)
//             magicnumber,
//             attempts: fixedAttempts  // Always set attempts to 5
//         });

//         // Save the new game entry
//         await newGame.save();

//         res.status(201).json({
//             message: 'Game entry created successfully!',
//             game: newGame
//         });
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

router.post('/', upload.none(), async (req, res) => {
    try {
        // Destructure the new fields from the request body
        const { username, name, prize, userid, magicnumber, hint, attempts } = req.body;

        // Validate input
        if (!username || !name || !prize || !userid || !magicnumber || !hint || !attempts) {
            return res.status(400).json({ message: 'Username, Name, Prize, User ID, Magic Number, Hint, and Attempts are required.' });
        }

        // Validate that magicnumber is a 5-digit number
        if (!/^\d{5}$/.test(magicnumber)) {
            return res.status(400).json({ message: 'Magic Number must be exactly 5 digits.' });
        }

        // Create a new game entry with the updated fields
        const newGame = new Game({
            username,
            name,         // Store player's name
            prize,        // Store prize
            userid,       // Store user ID
            magicnumber,  // Store magic number
            hint,         // Store hint
            attempts      // Store attempts
        });

        // Save the new game entry
        await newGame.save();

        res.status(201).json({
            message: 'Game entry created successfully!',
            game: newGame
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.post('/checkMagicNumber', upload.none(), async (req, res) => {
    try {
        const { magicnumber } = req.body;  // Extract magicnumber from form data

        if (!magicnumber) {
            return res.status(400).json({ message: 'Magic number is required.' });
        }

        // Find a game with the matching magicnumber
        const game = await Game.findOne({ magicnumber: magicnumber });

        if (game) {
            // If a match is found, return success message
            return res.status(200).json({ message: 'Magic number is correct!' });
        } else {
            // If no match is found, return failure message
            return res.status(400).json({ message: 'Please try again.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
});


router.post('/verify-magicnumber', upload.single('file'), async (req, res) => {
    try {
        const { _id, magicnumber } = req.body;  // Extract _id and magicnumber from the form data

        // Validate input
        if (!_id || !magicnumber) {
            return res.status(400).json({ message: 'Both _id and magicnumber are required.' });
        }

        // Check if a file was uploaded
        if (req.file) {
            console.log('File uploaded:', req.file);  // Log the uploaded file info (you can process it further if needed)
        }

        // Find the game by _id
        const game = await Game.findById(_id);

        // Check if the game exists
        if (!game) {
            return res.status(400).json({ message: 'The _id does not match. Please try again.' });
        }

        // Check if the magicnumber is correct
        if (game.magicnumber === magicnumber) {
            return res.status(200).json({
                message: 'Magic number is correct! You have won the reward.',
                game: game
            });
        } else {
            return res.status(400).json({
                message: 'Magic number is incorrect. Please try again.'
            });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});





router.get('/', async (req, res) => {
    try {
        // Retrieve all game records from the database
        const games = await Game.find();

        if (games.length === 0) {
            return res.status(404).json({ message: 'No games found.' });
        }

        // Add dynamic hint field to each game record
        const gamesWithHints = games.map(game => {
            // Extract two random digits from the magicnumber string
            const magicNumberString = game.magicnumber.toString();
            const randomIndexes = [Math.floor(Math.random() * magicNumberString.length), Math.floor(Math.random() * magicNumberString.length)];

            // Get the two digits from random positions
            const hint = magicNumberString[randomIndexes[0]] + magicNumberString[randomIndexes[1]];

            // Return the game object with the hint field
            return {
                ...game._doc,  // Spread the original game object
                hint: hint     // Add the new 'hint' field
            };
        });

        // Send the response with the games and their hints
        res.status(200).json({
            message: 'All game records retrieved successfully.',
            games: gamesWithHints
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



router.post('/getonegame', upload.none(), async (req, res) => {
    try {
        const { userid } = req.body;  // Access the userid from form data

        // Validate that the userid is provided
        if (!userid) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        // Retrieve game records that match the given userid
        const games = await Game.find({ userid });

        if (games.length === 0) {
            return res.status(404).json({ message: `No games found for User ID: ${userid}.` });
        }

        res.status(200).json({
            message: `Game records for User ID: ${userid} retrieved successfully.`,
            games: games
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/getgamebyid', upload.none(), async (req, res) => {
    try {
        const { _id } = req.body;  // Access the _id from form data

        // Validate that the _id is provided
        if (!_id) {
            return res.status(400).json({ message: '_id is required.' });
        }

        // Retrieve the game by _id
        const game = await Game.findById(_id);

        // Check if the game exists
        if (!game) {
            return res.status(404).json({ message: `Game not found with _id: ${_id}.` });
        }

        // Return the found game
        res.status(200).json({
            message: `Game with _id: ${_id} retrieved successfully.`,
            game: game
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.delete('/delete', upload.none(), async (req, res) => {
    try {
        const { gameId } = req.body;  // Retrieve game ID from form-data

        // Validate that the gameId is provided
        if (!gameId) {
            return res.status(400).json({ message: 'Game ID is required in form-data.' });
        }

        // Validate the ID to check if it's a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(gameId)) {
            return res.status(400).json({ message: 'Invalid game ID.' });
        }

        // Find and delete the game entry by its ID
        const deletedGame = await Game.findByIdAndDelete(gameId);

        if (!deletedGame) {
            return res.status(404).json({ message: 'Game not found.' });
        }

        res.status(200).json({ message: 'Game entry deleted successfully.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});




module.exports = router;