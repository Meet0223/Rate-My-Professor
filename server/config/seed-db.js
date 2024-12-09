import { pool } from './database.js'; // Database connection
import bcrypt from 'bcrypt'; // For hashing passwords

// Function to create the `users` table
const createUsersTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        fullname VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
    try {
        await pool.query(query);
        console.log('Users table created successfully.');
    } catch (err) {
        console.error('Error creating users table:', err.message);
    }
};

// Function to insert sample users
const seedUsers = async () => {
    const hashedPassword1 = await bcrypt.hash('password123', 10);
    const hashedPassword2 = await bcrypt.hash('demo123', 10);

    const query = `
    INSERT INTO users (fullname, email, password)
    VALUES 
        ('John Doe', 'john@example.com', $1),
        ('Jane Smith', 'jane@example.com', $2)
    ON CONFLICT (email) DO NOTHING; -- Avoid duplicate emails
    `;
    try {
        await pool.query(query, [hashedPassword1, hashedPassword2]);
        console.log('Sample users inserted successfully.');
    } catch (err) {
        console.error('Error inserting users:', err.message);
    }
};

// Main function to execute the script
const seedDatabase = async () => {
    await createUsersTable();
    await seedUsers();
    pool.end(); // Close the connection pool
};

// Run the script
seedDatabase();
