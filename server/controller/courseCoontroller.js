import { pool } from '../config/database.js';


const getOrCreateCourse = async (courseCode, courseName) => {
    try {

        const findCourse = await pool.query(
            'SELECT id FROM courses WHERE course_code = $1',
            [courseCode]
        );

        if (findCourse.rows.length > 0) {
            return findCourse.rows[0].id;
        }


        const newCourse = await pool.query(
            'INSERT INTO courses (course_code, course_name) VALUES ($1, $2) RETURNING id',
            [courseCode, courseName]
        );

        return newCourse.rows[0].id;
    } catch (error) {
        console.error('Error in getOrCreateCourse:', error);
        throw error;
    }
};


export const addCourseReview = async (req, res) => {
    try {

        const userId = req.user.userId;;
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Please login to add a review' 
            });
        }


        const {
            courseCode,
            courseName,
            semester,
            year,
            professorName,
            courseTopics,
            professorRating,
            difficultyLevel,
            attendance,
            textbook
        } = req.body;


        const courseId = await getOrCreateCourse(courseCode, courseName);


        const existingReview = await pool.query(
            `SELECT id FROM course_reviews 
             WHERE user_id = $1 AND course_id = $2 
             AND semester = $3 AND year = $4`,
            [userId, courseId, semester, year]
        );

        if (existingReview.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this course for this semester'
            });
        }


        const insertReview = await pool.query(
            `INSERT INTO course_reviews (
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
            RETURNING id`,
            [
                userId,
                courseId,
                semester,
                parseInt(year),
                professorName,
                courseTopics,
                parseFloat(professorRating),
                parseFloat(difficultyLevel),
                attendance === 'Needed',
                textbook === 'Needed'
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Course review added successfully',
            reviewId: insertReview.rows[0].id
        });

    } catch (error) {
        console.error('Error in addCourseReview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add course review',
            error: error.message
        });
    }
};


export const getCourseReviews = async (req, res) => {
    try {
        const { courseCode } = req.params;

        const reviews = await pool.query(
            `SELECT 
                cr.*,
                u.fullname as reviewer_name,
                c.course_code,
                c.course_name
             FROM course_reviews cr
             JOIN users u ON cr.user_id = u.id
             JOIN courses c ON cr.course_id = c.id
             WHERE c.course_code = $1
             ORDER BY cr.created_at DESC`,
            [courseCode]
        );

        res.json({
            success: true,
            reviews: reviews.rows
        });

    } catch (error) {
        console.error('Error in getCourseReviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch course reviews',
            error: error.message
        });
    }
};