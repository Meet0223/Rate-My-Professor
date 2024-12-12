import express from 'express';
import { pool } from '../config/database.js';
const router = express.Router();
import { authenticateJWT } from '../middleware/authJWT.js';


router.get('/search', async (req, res) => {
    try {
        const courseCode = req.query.courseCode;

        if (!courseCode) {

            return res.render('search', { 
                reviews: [], 
                searched: false,
                courseCode: ''
            });
        }


        const upperCourseCode = courseCode.toUpperCase();

        const query = `
            SELECT 
                cr.*,
                c.course_code,
                c.course_name,
                u.fullname as reviewer_name
            FROM course_reviews cr
            JOIN courses c ON cr.course_id = c.id
            JOIN users u ON cr.user_id = u.id
            WHERE UPPER(c.course_code) = $1
            ORDER BY cr.created_at DESC
        `;


        const result = await pool.query(query, [upperCourseCode]);


        res.render('search', {
            reviews: result.rows,
            searched: true,
            courseCode: courseCode
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).send('Error performing search');
    }
});

export default router;