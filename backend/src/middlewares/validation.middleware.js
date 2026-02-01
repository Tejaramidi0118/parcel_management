import { validationResult } from 'express-validator';

/**
 * Middleware to handle validation errors from express-validator
 * Usage: Add after validation chain in routes
 * Example: router.post('/login', [body('email').isEmail()], validate, loginController)
 */
export function validate(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
                value: err.value
            }))
        });
    }

    next();
}

/**
 * Helper to create a standardized error response for validation
 */
export function validationError(field, message) {
    return {
        success: false,
        message: 'Validation error',
        errors: [{ field, message }]
    };
}

export default validate;
