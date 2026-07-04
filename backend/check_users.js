import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import User from './models/User.js';

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Aggregate counts
        const roleCounts = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);

        console.log("--- ROLE COUNTS ---");
        console.log(JSON.stringify(roleCounts, null, 2));

        // Find Org Admins
        const orgAdmins = await User.find({ role: 'org_admin' }, 'email name');
        console.log("--- ORG ADMINS ---");
        console.log(JSON.stringify(orgAdmins, null, 2));

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
