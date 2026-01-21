/**
 * Misc Controller
 * Handles application configuration, constants and landing page data
 */

import { HTTP_STATUS, ROLES, PLAN_TYPES, PLAN_LIMITS, LEAVE_TYPES, ATTENDANCE_STATUS, EMPLOYMENT_STATUS, EMPLOYMENT_TYPES } from '../config/constants.js';

/**
 * @route   GET /api/misc/config
 * @desc    Get application configuration and constants
 * @access  Public
 */
export const getAppConfig = async (req, res, next) => {
    try {
        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                roles: ROLES,
                plan_types: PLAN_TYPES,
                plan_limits: PLAN_LIMITS,
                leave_types: LEAVE_TYPES,
                attendance_status: ATTENDANCE_STATUS,
                employment_status: EMPLOYMENT_STATUS,
                employment_types: EMPLOYMENT_TYPES
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/misc/landing-page
 * @desc    Get landing page content (features, benefits, etc.)
 * @access  Public
 */
export const getLandingPageData = async (req, res, next) => {
    try {
        const landingData = {
            features: [
                {
                    id: "analytics",
                    icon: "BarChart3",
                    title: "Advanced Analytics",
                    description: "Powerful dashboards with real-time KPIs, predictive analytics, and customizable reports to track workforce performance and trends.",
                    color: "from-blue-600 to-cyan-600"
                },
                {
                    id: "employee-management",
                    icon: "Users",
                    title: "Employee Management",
                    description: "Complete employee lifecycle management from onboarding to offboarding with centralized records and compliance tracking.",
                    color: "from-emerald-600 to-teal-600"
                },
                {
                    id: "time-attendance",
                    icon: "Clock",
                    title: "Time & Attendance",
                    description: "Automated time tracking, shift scheduling, and attendance monitoring with integration to payroll systems.",
                    color: "from-violet-600 to-purple-600"
                },
                {
                    id: "performance",
                    icon: "TrendingUp",
                    title: "Performance Reviews",
                    description: "360-degree feedback system, goal tracking, and continuous performance evaluation to drive employee development.",
                    color: "from-orange-600 to-amber-600"
                },
                {
                    id: "leave-management",
                    icon: "FileText",
                    title: "Leave Management",
                    description: "Streamlined leave requests, approvals, and balance tracking with policy automation and calendar integration.",
                    color: "from-pink-600 to-rose-600"
                },
                {
                    id: "security",
                    icon: "Shield",
                    title: "Compliance & Security",
                    description: "Enterprise-grade security with SSO, RBAC, audit trails, and compliance with GDPR, SOC 2, and industry standards.",
                    color: "from-indigo-600 to-blue-600"
                }
            ],
            benefits: [
                {
                    id: "productivity",
                    icon: "Target",
                    title: "Increase Productivity",
                    description: "Automate repetitive HR tasks and reduce administrative overhead by up to 60%"
                },
                {
                    id: "decision-making",
                    icon: "Zap",
                    title: "Faster Decision Making",
                    description: "Access real-time insights and reports to make informed strategic decisions quickly"
                },
                {
                    id: "retention",
                    icon: "Award",
                    title: "Improve Retention",
                    description: "Identify at-risk employees early and implement targeted retention strategies"
                },
                {
                    id: "experience",
                    icon: "Users",
                    title: "Better Employee Experience",
                    description: "Self-service portals and mobile access empower employees to manage their own data"
                }
            ],
            stats: {
                uptime: "99.9%",
                activeUsers: "10K+",
                support: "24/7"
            },
            trustCompanies: ["AUTOPARTS", "MANUFACTURING", "TECHNOLOGY", "RETAIL", "HEALTHCARE"]
        };

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: landingData
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/misc/holidays
 * @desc    Get upcoming holidays
 * @access  Public/Private
 */
export const getHolidays = async (req, res, next) => {
    try {
        const holidays = [
            { id: 1, name: "New Year's Day", date: "2024-01-01", type: "Federal" },
            { id: 2, name: "MLK Day", date: "2024-01-15", type: "Federal" },
            { id: 3, name: "President's Day", date: "2024-02-19", type: "Federal" },
            { id: 4, name: "Memorial Day", date: "2024-05-27", type: "Federal" },
            { id: 5, name: "Juneteenth", date: "2024-06-19", type: "Federal" },
            { id: 6, name: "Independence Day", date: "2024-07-04", type: "Federal" },
            { id: 7, name: "Labor Day", date: "2024-09-02", type: "Federal" },
            { id: 8, name: "Thanksgiving Day", date: "2024-11-28", type: "Federal" },
            { id: 9, name: "Christmas Day", date: "2024-12-25", type: "Federal" }
        ];

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: holidays
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getAppConfig,
    getLandingPageData,
    getHolidays
};
