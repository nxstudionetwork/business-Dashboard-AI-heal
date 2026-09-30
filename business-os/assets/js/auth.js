/* ============================================================
   AUTH.JS — Authentication with LocalStorage
   ============================================================ */

const Auth = (() => {

  const USERS = [
    { email: 'admin@company.com', password: 'admin123', name: 'Admin User', role: 'admin' },
    { email: 'manager@company.com', password: 'manager123', name: 'Sarah Johnson', role: 'manager' },
  ];

  const SESSION_KEY = 'bos_session';

  function login(email, password, remember = false) {
    const user = USERS.find(u =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === password
    );
    if (!user) return false;

    const session = {
      email: user.email,
      name: user.name,
      role: user.role,
      loginTime: new Date().toISOString(),
      remember,
    };

    if (remember) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
    return true;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
  }

  function isLoggedIn() {
    return !!(getSession());
  }

  function getSession() {
    try {
      const ls = localStorage.getItem(SESSION_KEY);
      const ss = sessionStorage.getItem(SESSION_KEY);
      return ls ? JSON.parse(ls) : (ss ? JSON.parse(ss) : null);
    } catch { return null; }
  }

  function getUser() {
    return getSession();
  }

  function requireAuth() {
    if (!isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  return { login, logout, isLoggedIn, getSession, getUser, requireAuth };
})();
