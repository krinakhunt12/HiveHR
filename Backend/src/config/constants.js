/**
 * Application Constants
 */

export const ROLES = {
    SUPER_ADMIN: 'super_admin', // Multi-tenant platform owner
    COMPANY_ADMIN: 'company_admin', // Company owner
    HR: 'hr',
    MANAGER: 'manager',
    EMPLOYEE: 'employee'
};

export const PLAN_TYPES = {
    BASIC: 'basic',
    PROFESSIONAL: 'professional',
    ENTERPRISE: 'enterprise'
};

export const PLAN_LIMITS = {
    [PLAN_TYPES.BASIC]: { employees: 50, departments: 3 },
    [PLAN_TYPES.PROFESSIONAL]: { employees: 500, departments: 20 },
    [PLAN_TYPES.ENTERPRISE]: { employees: 1000000, departments: 1000 }
};

export const LEAVE_TYPES = {
    SICK: 'sick',
    CASUAL: 'casual',
    EARNED: 'earned',
    MATERNITY: 'maternity',
    PATERNITY: 'paternity',
    UNPAID: 'unpaid'
};

export const LEAVE_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled'
};

export const ATTENDANCE_STATUS = {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late',
    HALF_DAY: 'half-day',
    WORK_FROM_HOME: 'work-from-home'
};

export const EMPLOYMENT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ON_LEAVE: 'on-leave',
    TERMINATED: 'terminated'
};

export const EMPLOYMENT_TYPES = {
    FULL_TIME: 'full-time',
    PART_TIME: 'part-time',
    CONTRACT: 'contract',
    INTERN: 'intern'
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
};

export const ERROR_MESSAGES = {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'You do not have permission to perform this action',
    NOT_FOUND: 'Resource not found',
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User already exists',
    VALIDATION_ERROR: 'Validation error',
    INTERNAL_ERROR: 'Internal server error',
    INVALID_TOKEN: 'Invalid or expired token'
};

export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully'
};
