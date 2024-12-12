import { pool } from '../config/database.js';
import express from 'express';
const router = express.Router();
import { authenticateJWT } from '../middleware/authJWT.js';


router.get('/get-review/:id', authenticateJWT, async (req, res) => {
    
    try {
        const reviewId = req.params.id;
        const userId = req.user.userId;
        const query = `
            SELECT 
                cr.*,
                c.course_code,
                c.course_name
            FROM course_reviews cr
            JOIN courses c ON cr.course_id = c.id
            WHERE cr.id = $1 AND cr.user_id = $2
        `;
        
        const result = await pool.query(query, [reviewId, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


router.get('/edit-review/:id', authenticateJWT, async (req, res) => {
    console.log('heyy');
    try {
        const reviewId = req.params.id;
        const userId = req.user.userId;
        const query = `
            SELECT 
                cr.*,
                c.course_code,
                c.course_name
            FROM course_reviews cr
            JOIN courses c ON cr.course_id = c.id
            WHERE cr.id = $1 AND cr.user_id = $2
        `;
        
        const result = await pool.query(query, [reviewId, userId]);
        if (result.rows.length === 0) {
            return res.redirect('/profile');
        }
        res.render('edit-review', { review: result.rows[0] });
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/profile');
    }
});


router.post('/edit-review/:id', authenticateJWT, async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.userId;
        const {
            professor_name,
            course_description,
            professor_rating,
            difficulty_level,
            attendance_required,
            textbook_required,
            semester,
            year
        } = req.body;

        const query = `
            UPDATE course_reviews 
            SET 
                professor_name = $1,
                course_description = $2,
                professor_rating = $3,
                difficulty_level = $4,
                attendance_required = $5,
                textbook_required = $6,
                semester = $7,
                year = $8
            WHERE id = $9 AND user_id = $10
            RETURNING *
        `;
        const values = [
            professor_name,
            course_description,
            parseFloat(professor_rating),
            parseFloat(difficulty_level),
            attendance_required === 'true',
            textbook_required === 'true',
            semester,
            parseInt(year),
            reviewId,
            userId
        ];
        await pool.query(query, values);
        res.redirect('/profile');
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Failed to update review' });
    }
});

export default router;