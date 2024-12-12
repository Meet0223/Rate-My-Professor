import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { pool } from './config/database.js';
dotenv.config();
import cookieParser from 'cookie-parser';
import { addCourseReview } from './controller/courseCoontroller.js'
import validateCourseInput from './middleware/courseMiddleware.js'
import editReviewRoutes from './routes/editReviewRoutes.js';
import { authenticateJWT } from './middleware/authJWT.js';
import searchRoutes from './routes/searchRoutes.js';




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
app.use('/', editReviewRoutes); 
app.use('/', searchRoutes);



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




app.get('/profile', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.redirect('/login');
        }


        const userQuery = 'SELECT id, fullname, email FROM users WHERE id = $1';
        const userResult = await pool.query(userQuery, [userId]);
        
        if (userResult.rows.length === 0) {
            return res.redirect('/login');
        }
        
        const user = userResult.rows[0];


        const reviewsQuery = `
            SELECT 
                cr.id as review_id,
                cr.semester,
                cr.year,
                cr.professor_name,
                cr.course_description,
                cr.professor_rating,
                cr.difficulty_level,
                cr.attendance_required,
                cr.textbook_required,
                cr.created_at,
                c.course_code,
                c.course_name,
                u.fullname as reviewer_name,
                u.email as reviewer_email
            FROM course_reviews cr
            JOIN courses c ON cr.course_id = c.id
            JOIN users u ON cr.user_id = u.id
            WHERE cr.user_id = $1
            ORDER BY cr.created_at DESC
        `;

        const reviewsResult = await pool.query(reviewsQuery, [userId]);

        res.render('profile', {
            user: user,             
            reviews: reviewsResult.rows  
        });

    } catch (error) {
        console.error('Error in profile route:', error);
        res.redirect('/login');
    }
});

app.get('/addcourse', authenticateJWT, (req, res) => {
    res.render('addcourse');
})


app.delete('/delete-review/:id', authenticateJWT, async (req, res) => {
    try {
        
        const reviewId = req.params.id;
        

        const userId = req.user.userId;

        

        const checkQuery = `
            SELECT user_id 
            FROM course_reviews 
            WHERE id = $1
        `;
        const checkResult = await pool.query(checkQuery, [reviewId]);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (checkResult.rows[0].user_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized to delete this review' });
        }


        const deleteQuery = `
            DELETE FROM course_reviews 
            WHERE id = $1 AND user_id = $2
        `;
        await pool.query(deleteQuery, [reviewId, userId]);
        res.status(200).json({ message: 'Review deleted successfully' });
        

    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});


app.post('/addCourse', authenticateJWT, validateCourseInput, addCourseReview);

app.post('/logout', (req, res) => {
    res.clearCookie('token'); 
    res.redirect('/login');
});

app.get('/search', (req, res) => {
    res.render('search');
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

