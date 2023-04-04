import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js"

/* REGISTER USER */
export const register = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            picturePath,
            friends,
            location,
            occupation
        } = req.body;

        /* ENCRYPTING PASSWORD */
        const salt = await bcrypt.genSalt()
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: passwordHash,
            picturePath,
            friends,
            location,
            occupation,
            // random numbers
            viewedProfile: Math.floor(Math.random() * 10000),
            impressions: Math.floor(Math.random() * 10000),
        });
        
        const savedUser = await newUser.save();
        // sends status code of 201 = userCreated and sends json of savedUser
        res.status(201).json(savedUser);

    }  catch (err){
        // if error, send status code 500 and json message of error
        res.status(500).json({ error: err.message});
    }

};


/* LOG IN */
export const login = async (req, res) => {
    try {
        //check if user exists
        const { email, password } = req.body;
        const user = await User.findOne({ email: email});
        if (!user) return res.status(400).json({ msg: "User does not exist"});

        //check if password correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials."});

        //send JWT seceret string as authentication verification
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        // delete password so password isnt sent back
        delete user.password;
        // send user verifcation
        res.status(200).json({ token, user});

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}