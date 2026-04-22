export interface User {
    uid?: string;
    full_name: string;
    email: string;
    password: string; // In real app, this would be hashed
    isActive: boolean;
    createdAt: string;
    lastLogin?: string;
    role: string;
    ph_country_code: string;
    phone_number: string;
    // status: boolean;
    address: string;
}

export interface CreateUserData {
    full_name: string;
    email: string;
    password: string;
    role: string;
    ph_country_code: string;
    phone_number: string;
    // status: string;
    address: string;
    isActive: boolean;
}

export interface EmailData {
    to: string[];
    subject: string;
    message: string;
}
