export type Role = "SUPER_ADMIN" | "VIEW_ADMIN" | "EMPLOYEE";

export interface SessionPayload {
    userId: string;
    username: string;
    role: Role;
    employeeId?: string | null;
    ts: number;
}

export function encodeSession(payload: SessionPayload): string {
    return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function decodeSession(token: string): SessionPayload | null {
    try {
        const json = Buffer.from(token, "base64").toString("utf-8");
        return JSON.parse(json) as SessionPayload;
    } catch {
        return null;
    }
}
