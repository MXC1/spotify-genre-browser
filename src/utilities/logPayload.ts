export type LogPayload = {
    timestamp: string;
    level: string;
    session_id: string;
    message: string;
    event_id: string | null;
    context?: Record<string, unknown>;
};