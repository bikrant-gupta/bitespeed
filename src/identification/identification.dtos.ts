export interface IdentificationPayload {
    email?: string;
    phoneNumber?: string;
}

export interface IdentificationResponse {
    contact: {
        primaryContatctId: number;
        emails: string[];
        phoneNumbers: string[];
        secondaryContactIds: number[];
    };
}