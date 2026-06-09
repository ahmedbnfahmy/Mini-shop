export function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof decoded.exp === 'number' ? decoded.exp : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const exp = getTokenExpiry(token);
  if (!exp) return true;
  return Date.now() >= exp * 1000;
}
