import User from "../models/User";

/* READ */
export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        res.status(200).json(user);

    } catch (err) {
        res.status(404).json({ message: err.message});
    }
}

export const getUserFriends = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        // reformatt friends list
        const friends = await Promise.all(
            user.friends.map((id) => User.findById(id))
        );
        const formattedFriends = friends.map(
            ({ _id, firstName, lastName, occupation, location, picturePath }) => {
                return { _id, firstName, lastName, occupation, locatoin, picturePath };
            }
        );
        
        //send back friends list
        res.status(200).json(formattedFriends);

    } catch (err) {
        res.status(404).json({ message: err.message });
    }

    
}

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
    try {
        const { id, friendId } = req.params;
        const user = await User.findById(id);
        const friend = await User.findById(friendId);

        if (user.friends.includes(friendId)) {
            // if friendId is in user friend id, then remove friendid
            user.friends = user.friends.filter((id) => id !== friendId);
            // inside friend, remove user from friend's friend list
            friend.friends = friend.friends.filter((id) => id !== id);
        }
        else {
            //add each other if not friends
            user.friends.push(friendId);
            friend.friends.push(id);
        }
        await user.save();
        await friend.save();

        //reformatt friends list
        const friends = await Promise.all(
            user.friends.map((id) => User.findById(id))
        );
        const formattedFriends = friends.map(
            ({ _id, firstName, lastName, occupation, location, picturePath }) => {
                return { _id, firstName, lastName, occupation, locatoin, picturePath };
            }
        );
        
        //send back friends list
        res.status(200).json(formattedFriends);

    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}