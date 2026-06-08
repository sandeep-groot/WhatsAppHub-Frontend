export const SESSION_EXPIRED_MESSAGE =
  "Your session has expired. Please sign in again.";

type SessionExpiredHandler = (message: string) => void;

const handlers = new Set<SessionExpiredHandler>();

export function onSessionExpired(handler: SessionExpiredHandler): () => void {
  handlers.add(handler);
  return () => handlers.delete(handler);
}

export function notifySessionExpired(
  message: string = SESSION_EXPIRED_MESSAGE,
): void {
  handlers.forEach((handler) => handler(message));
}
