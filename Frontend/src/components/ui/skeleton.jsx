/**
 * Loading Skeleton Components
 * Professional loading states for different UI elements
 */

import React from 'react';

/**
 * Base Skeleton component
 */
export const Skeleton = ({ className = '', ...props }) => {
    return (
        <div
            className={`animate-pulse bg-gray-200 rounded ${className}`}
            {...props}
        />
    );
};

/**
 * Card Skeleton
 */
export const CardSkeleton = () => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-4/6" />
        </div>
    );
};

/**
 * Table Skeleton
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="border-b border-gray-200 p-4">
                <div className="flex gap-4">
                    {Array.from({ length: columns }).map((_, i) => (
                        <Skeleton key={i} className="h-4 flex-1" />
                    ))}
                </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-200">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="p-4">
                        <div className="flex gap-4">
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <Skeleton key={colIndex} className="h-4 flex-1" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * List Skeleton
 */
export const ListSkeleton = ({ items = 5 }) => {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                        <div className="flex-1">
                            <Skeleton className="h-4 w-1/3 mb-2" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * Profile Skeleton
 */
export const ProfileSkeleton = () => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="flex-1">
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <Skeleton className="h-3 w-1/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div>
                    <Skeleton className="h-3 w-1/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div>
                    <Skeleton className="h-3 w-1/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        </div>
    );
};

/**
 * Stats Grid Skeleton
 */
export const StatsGridSkeleton = ({ count = 4 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/3" />
                </div>
            ))}
        </div>
    );
};

/**
 * Form Skeleton
 */
export const FormSkeleton = ({ fields = 4 }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Skeleton className="h-6 w-1/3 mb-6" />
            <div className="space-y-4">
                {Array.from({ length: fields }).map((_, i) => (
                    <div key={i}>
                        <Skeleton className="h-4 w-1/4 mb-2" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ))}
            </div>
            <div className="flex gap-3 mt-6">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    );
};

/**
 * Full Page Loading
 */
export const PageLoading = ({ message = 'Loading...' }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black mb-4"></div>
                <p className="text-gray-600">{message}</p>
            </div>
        </div>
    );
};

/**
 * Inline Spinner
 */
export const Spinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-3',
        xl: 'h-12 w-12 border-4'
    };

    return (
        <div
            className={`inline-block animate-spin rounded-full border-gray-300 border-t-black ${sizes[size]} ${className}`}
        />
    );
};

export default Skeleton;
