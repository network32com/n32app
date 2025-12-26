export const PROCEDURE_TYPES = [
    { value: 'rct', label: 'RCT' },
    { value: 'restorations', label: 'Restorations' },
    { value: 'cosmetics', label: 'Cosmetics' },
    { value: 'prosthesis', label: 'Prosthesis' },
    { value: 'periodontic_surgeries', label: 'Periodontic Surgeries' },
    { value: 'implants', label: 'Implants' },
    { value: 'extractions', label: 'Extractions' },
    { value: 'surgeries', label: 'Surgeries' },
    { value: 'orthodontics', label: 'Orthodontics' },
    { value: 'fmr', label: 'FMR' },
    { value: 'other', label: 'Other' },
] as const;

export const SPECIALTIES = [
    { value: 'general_dentistry', label: 'General Dentistry' },
    { value: 'orthodontics', label: 'Orthodontics' },
    { value: 'endodontics', label: 'Endodontics' },
    { value: 'periodontics', label: 'Periodontics' },
    { value: 'prosthodontics', label: 'Prosthodontics' },
    { value: 'oral_surgery', label: 'Oral & Maxillofacial Surgery' },
    { value: 'oral_medicine_radiology', label: 'Oral Medicine & Radiology' },
    { value: 'oral_pathology', label: 'Oral Pathology' },
    { value: 'pediatric_dentistry', label: 'Pediatric Dentistry' },
    { value: 'cosmetic_dentistry', label: 'Cosmetic Dentistry' },
    { value: 'public_health', label: 'Public Health' },
] as const;

export const USER_ROLES = [
    { value: 'student', label: 'Student' },
    { value: 'professional', label: 'Professional' },
    { value: 'clinic_owner', label: 'Clinic Owner' },
] as const;

export const NAME_TITLES = [
    { value: 'Dr.', label: 'Dr.' },
    { value: 'Mr.', label: 'Mr.' },
    { value: 'Ms.', label: 'Ms.' },
    { value: 'Mrs.', label: 'Mrs.' },
] as const;

export const ROUTES = {
    HOME: '/',
    AUTH: {
        SIGNUP: '/auth/signup',
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
    },
    ONBOARDING: '/onboarding',
    DASHBOARD: '/dashboard',
    PROFILE: {
        VIEW: (userId: string) => `/profile/${userId}`,
        EDIT: '/profile/edit',
    },
    CASES: {
        FEED: '/cases',
        DETAIL: (caseId: string) => `/cases/${caseId}`,
        CREATE: '/cases/create',
        EDIT: (caseId: string) => `/cases/${caseId}/edit`,
    },
    CLINICS: {
        LIST: '/clinics',
        DETAIL: (clinicId: string) => `/clinics/${clinicId}`,
        CREATE: '/clinics/create',
        EDIT: (clinicId: string) => `/clinics/${clinicId}/edit`,
    },
    SEARCH: '/search',
} as const;
