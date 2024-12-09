import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
import { pool } from './config/database.js';
dotenv.config();
import cookieParser from 'cookie-parser';
//test
import courses from './data/courses.js';



const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);  
const __dirname = path.dirname(__filename);

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
    req.cookies?.token;

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  
        next();  
    } catch (err) {
        res.status(400).json({ error: 'Invalid or expired token.' });
    }
};

app.get('/', (req, res) => {
    res.render("sign-up", { fullname: '', email: '' })
});

app.get('/login', (req, res) => {
    res.render("sign-in", { email: '' })
});

app.post('/register', async (req, res) => {
    const { fullname, email, password } = req.body;


    const checkQuery = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(checkQuery, [email]);

    if (result.rows.length > 0) {
        return res.status(400).json({ error: 'Email already in use.' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const insertQuery = `
        INSERT INTO users (fullname, email, password) 
        VALUES ($1, $2, $3) 
        RETURNING id, fullname, email
    `;
    
    try {
        const newUser = await pool.query(insertQuery, [fullname, email, hashedPassword]);


        const user = newUser.rows[0];
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });


        res.status(201).json({
            message: 'User created successfully.',


        });
    } catch (err) {
        console.error('Error inserting user:', err.message);
        res.status(500).json({ error: 'Database error.' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;


    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ error: 'Invalid email or password.' });
    }


    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 3600000 
    });

    res.status(200).json({
        message: 'Login successful.',
        token,  
        user: { id: user.id, fullname: user.fullname, email: user.email }
    });
});


//test

app.get('/profile', authenticateJWT, (req, res) => {

    // Extracts the username from the first part of the email

    const email = req.user.email;
    let username = email.split('@')[0];
    username = username.charAt(0).toUpperCase() + username.slice(1);
    res.render('profile', { username, courses: courses.courseData} );
});

app.post('/logout', (req, res) => {
    res.clearCookie('token'); // Clear the authentication token cookie
    res.status(200).json({ message: 'Logged out successfully.' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

