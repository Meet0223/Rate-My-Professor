import { pool } from './database.js';
import bcrypt from 'bcrypt';

// Drop existing tables if they exist
const dropTables = async () => {
    const query = `
    DROP TABLE IF EXISTS course_reviews;
    DROP TABLE IF EXISTS courses;
    DROP TABLE IF EXISTS users;
    `;
    try {
        await pool.query(query);
        console.log('Existing tables dropped successfully.');
    } catch (err) {
        console.error('Error dropping tables:', err.message);
    }
};

// Function to create the users table
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

// Function to create the courses table
const createCoursesTable = async () => {
    const query = `
    CREATE TABLE courses (
        id SERIAL PRIMARY KEY,
        course_code VARCHAR(10) NOT NULL UNIQUE,
        course_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
    
    try {
        await pool.query(query);
        console.log('Courses table created successfully.');
    } catch (err) {
        console.error('Error creating courses table:', err.message);
        throw err;
    }
};

// Function to create the course reviews table
const createCourseReviewsTable = async () => {
    const query = `
    CREATE TABLE course_reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        semester VARCHAR(10) NOT NULL,
        year INTEGER NOT NULL,
        professor_name VARCHAR(100) NOT NULL,
        course_description TEXT,
        professor_rating DECIMAL(2,1) CHECK (professor_rating >= 0 AND professor_rating <= 5),
        difficulty_level DECIMAL(2,1) CHECK (difficulty_level >= 0 AND difficulty_level <= 5),
        attendance_required BOOLEAN NOT NULL,
        textbook_required BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_semester CHECK (semester IN ('Spring', 'Summer', 'Fall', 'Winter')),
        CONSTRAINT valid_year CHECK (year >= 2020 AND year <= 2024)
    );
    `;
    
    try {
        await pool.query(query);
        console.log('Course Reviews table created successfully.');
    } catch (err) {
        console.error('Error creating course reviews table:', err.message);
        throw err;
    }
};

// Function to insert sample courses
const seedCourses = async () => {
    const query = `
    INSERT INTO courses (course_code, course_name)
    VALUES 
        ('CSC317', 'Web Software Development'),
        ('CSC415', 'Operating System Principles'),
        ('CSC413', 'Software Development'),
        ('CSC220', 'Data Structures'),
        ('CSC340', 'Programming Methodology'),
        ('CSC600', 'Advanced Programming')
    RETURNING id, course_code;
    `;

    try {
        const result = await pool.query(query);
        console.log('Sample courses inserted successfully.');
        return result.rows;
    } catch (err) {
        console.error('Error inserting courses:', err.message);
        throw err;
    }
};

// Function to insert sample reviews
const seedReviews = async (courses) => {
    const professors = [
        'Dr. John Smith', 'Dr. Emily Johnson', 'Prof. Michael Brown',
        'Dr. Sarah Wilson', 'Prof. David Lee', 'Dr. Jennifer Garcia',
        'Prof. Robert Taylor', 'Dr. Lisa Anderson', 'Prof. James Martin',
        'Dr. Maria Rodriguez', 'Prof. William White', 'Dr. Elizabeth Thomas',
        'Prof. Richard Davis', 'Dr. Patricia Moore', 'Prof. Joseph Clark',
        'Dr. Margaret Hall', 'Prof. Charles King', 'Dr. Susan Wright',
        'Dr. Kevin Brown', 'Prof. Laura Martinez', 'Dr. Thomas Anderson',
        'Prof. Nancy Lee', 'Dr. Daniel Wilson', 'Prof. Michelle Garcia',
        'Dr. Christopher Davis', 'Prof. Rachel Thompson', 'Dr. Steven Johnson',
        'Prof. Karen White', 'Dr. Andrew Clark', 'Prof. Jessica Wright',
        'Dr. Matthew Taylor', 'Prof. Sandra Martinez', 'Dr. Ryan Thomas',
        'Prof. Emma Wilson', 'Dr. Brian Garcia', 'Prof. Amanda Davis'
    ];

    const semesters = ['Fall', 'Spring', 'Summer', 'Winter'];
    const years = [2023, 2024];

    let reviewCount = 0;
    
    for (const course of courses) {

        for (let i = 0; i < 6; i++) {
            const reviewQuery = `
            INSERT INTO course_reviews (
                user_id,
                course_id,
                semester,
                year,
                professor_name,
                course_description,
                professor_rating,
                difficulty_level,
                attendance_required,
                textbook_required
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `;

            const randomRating = parseFloat((3 + Math.random() * 2).toFixed(1));
            const randomDifficulty = parseFloat((2 + Math.random() * 3).toFixed(1));
            
            try {
                await pool.query(reviewQuery, [
                    1, // user_id
                    course.id,
                    semesters[i % 4],
                    years[Math.floor(i / 3)],
                    professors[reviewCount],
                    `Comprehensive course covering essential topics in ${course.course_name}. The professor's teaching style was ${Math.random() > 0.5 ? 'engaging and effective' : 'challenging but informative'}. The course ${Math.random() > 0.5 ? 'heavily emphasizes practical applications' : 'focuses on theoretical concepts'}.`,
                    randomRating,
                    randomDifficulty,
                    Math.random() > 0.5,
                    Math.random() > 0.5
                ]);
                reviewCount++;
            } catch (err) {
                console.error(`Error inserting review for course ${course.course_code}:`, err.message);
            }
        }
    }
    console.log('Sample reviews inserted successfully.');
};

// Main function to execute the script
const seedDatabase = async () => {
    try {
        await dropTables();
        await createUsersTable();
        await seedUsers();
        await createCoursesTable();
        await createCourseReviewsTable();
        const courses = await seedCourses();
        await seedReviews(courses);
        console.log('Database seeding completed successfully.');
    } catch (err) {
        console.error('Error seeding database:', err.message);
    } finally {
        await pool.end();
    }
};

// Run the script
seedDatabase();