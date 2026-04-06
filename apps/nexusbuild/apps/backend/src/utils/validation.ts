import { z } from 'zod';

// Email validation
const emailSchema = z.string().email();

export const isValidEmail = (email: string): boolean => {
    try {
        emailSchema.parse(email);
        return true;
    } catch {
        return false;
    }
};

// Password validation
export const isValidPassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }

    return { valid: true };
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
};

// Username validation
export const isValidUsername = (username: string): { valid: boolean; message?: string } => {
    if (username.length < 3) {
        return { valid: false, message: 'Username must be at least 3 characters long' };
    }

    if (username.length > 20) {
        return { valid: false, message: 'Username must be at most 20 characters long' };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return { valid: false, message: 'Username can only contain letters, numbers, underscores, and hyphens' };
    }

    return { valid: true };
};

// Build validation
export const validateBuild = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        errors.push('Build name is required');
    }

    if (data.name && data.name.length > 100) {
        errors.push('Build name must be at most 100 characters');
    }

    if (data.description && data.description.length > 500) {
        errors.push('Build description must be at most 500 characters');
    }

    if (data.totalPrice && isNaN(parseFloat(data.totalPrice))) {
        errors.push('Total price must be a valid number');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

// Part validation
export const validatePart = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        errors.push('Part name is required');
    }

    if (data.name && data.name.length > 200) {
        errors.push('Part name must be at most 200 characters');
    }

    if (!data.category || typeof data.category !== 'string' || data.category.trim().length === 0) {
        errors.push('Part category is required');
    }

    if (data.price && isNaN(parseFloat(data.price))) {
        errors.push('Price must be a valid number');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

