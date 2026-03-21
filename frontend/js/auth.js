// ============================================================
// auth.js — JWT storage, retrieval, redirect guard
// ============================================================

const Auth = (() => {
  const TOKEN_KEY = 'gasc_token';
  const USER_KEY  = 'gasc_user';

  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const getUser  = () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  };

  const setSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const logout = () => {
    clearSession();
    window.location.href = 'index.html';
  };

  // Redirect to login if not authenticated
  const requireAuth = () => {
    if (!getToken() || !getUser()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  };

  // Redirect to login if not a specific role
  const requireRole = (role) => {
    if (!requireAuth()) return false;
    const user = getUser();
    if (user.role !== role) {
      window.location.href = 'dashboard.html';
      return false;
    }
    return true;
  };

  // Redirect if already logged in
  const redirectIfLoggedIn = () => {
    if (getToken() && getUser()) {
      window.location.href = 'dashboard.html';
    }
  };

  return { getToken, getUser, setSession, clearSession, logout, requireAuth, requireRole, redirectIfLoggedIn };
})();
