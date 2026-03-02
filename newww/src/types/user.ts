export interface User {
    id: string;
    fullName: string;
    email: string;
    password: string; // In real app, this would be hashed
    status: 'active' | 'banned';
    createdAt: string;
    lastLogin?: string;
}

export interface CreateUserData {
    fullName: string;
    email: string;
    password: string;
}

export interface EmailData {
    to: string[];
    subject: string;
    message: string;
}
