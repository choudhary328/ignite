import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import User from './models/User.js';

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // List all users
        const users = await User.find({}, 'name email role');
        console.log("--- ALL USERS ---");
        console.log(JSON.stringify(users, null, 2));

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listUsers();
