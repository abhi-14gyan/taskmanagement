/**
 * Seed Script — creates a test Admin and a test Manager user
 * Run with: npx ts-node -e "require('./src/scripts/seed.ts')"
 * OR:        npx ts-node src/scripts/seed.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User.model';
import { env } from '../config/env';

const SEED_USERS = [
    {
        name: 'Admin Tester',
        email: 'admin@taskflow.dev',
        password: 'Admin@1234',
        role: 'admin' as const,
    },
    {
        name: 'Manager Tester',
        email: 'manager@taskflow.dev',
        password: 'Manager@1234',
        role: 'manager' as const,
    },
];

async function seed() {
    console.log('🔌 Connecting to MongoDB…');
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to:', env.MONGODB_URI);

    const results: { role: string; email: string; _id: string; name: string }[] = [];

    for (const userData of SEED_USERS) {
        // Remove existing seed user so re-runs are idempotent
        await User.deleteOne({ email: userData.email });

        // Pass plain-text password — the Mongoose pre('save') hook hashes it once.
        // Do NOT pre-hash here; double-hashing means bcrypt.compare() always fails.
        const user = await User.create({
            name: userData.name,
            email: userData.email,
            password: userData.password,   // plain text ✅
            role: userData.role,
        });

        results.push({
            role: user.role,
            name: user.name,
            email: user.email,
            _id: (user._id as mongoose.Types.ObjectId).toString(),
        });

        console.log(`\n✅ ${userData.role.toUpperCase()} created`);
        console.log(`   Name  : ${user.name}`);
        console.log(`   Email : ${user.email}`);
        console.log(`   Pass  : ${userData.password}`);
        console.log(`   Role  : ${user.role}`);
        console.log(`   ID    : ${(user._id as mongoose.Types.ObjectId).toString()}`);
    }

    console.log('\n\n══════════════════════════════════════════════════');
    console.log('  SEED COMPLETE — copy these IDs into README.md');
    console.log('══════════════════════════════════════════════════');
    results.forEach(u => {
        console.log(`  ${u.role.padEnd(8)}: ${u._id}  (${u.email})`);
    });
    console.log('══════════════════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
