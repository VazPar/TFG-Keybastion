export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

export interface UserCredentials {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
}

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
    createdAt: string;
    lastLogin?: string;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
}

export interface PasswordGenerationRequest {
    length?: number;
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
    excludeSimilarCharacters?: boolean;
}

export interface PasswordGenerationResponse {
    password: string;
    strength: number;
    suggestions?: string[];
}

export interface PasswordEvaluationRequest {
    password: string;
}

export interface PasswordEvaluationResponse {
    strength: number;
    feedback: {
        warning?: string;
        suggestions: string[];
    };
}
