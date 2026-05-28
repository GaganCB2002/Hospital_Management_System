const VISITOR_KEY = 'curepulse_visitors_v1';

function detectBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  return 'Unknown';
}

function detectOS() {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS')) return 'iOS';
  return 'Unknown';
}

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet';
  if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return 'Mobile';
  return 'Desktop';
}

function generateSessionId() {
  return 'vis_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

export function getVisitors() {
  try {
    const data = localStorage.getItem(VISITOR_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveVisitors(visitors) {
  localStorage.setItem(VISITOR_KEY, JSON.stringify(visitors));
}

export function capturePageView(page, user = null) {
  const visitors = getVisitors();
  const sessionId = sessionStorage.getItem('curepulse_session_id') || generateSessionId();
  sessionStorage.setItem('curepulse_session_id', sessionId);

  const now = new Date().toISOString();
  let session = visitors.find(s => s.sessionId === sessionId);

  if (session) {
    const lastPage = session.pages[session.pages.length - 1];
    if (lastPage && !lastPage.timeSpent) {
      lastPage.timeSpent = Math.round((Date.now() - new Date(lastPage.enteredAt).getTime()) / 1000);
    }
    session.pages.push({ path: page, enteredAt: now, timeSpent: null });
    session.lastActivity = now;
    session.pageCount = session.pages.length;
  } else {
    session = {
      sessionId,
      firstVisit: now,
      lastActivity: now,
      pageCount: 1,
      device: {
        browser: detectBrowser(),
        os: detectOS(),
        deviceType: getDeviceType(),
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        userAgent: navigator.userAgent.slice(0, 200),
      },
      user: user ? { name: user.name, email: user.email, role: user.role } : null,
      referrer: document.referrer || 'Direct',
      pages: [{ path: page, enteredAt: now, timeSpent: null }],
    };
    visitors.push(session);
  }

  saveVisitors(visitors);
  return session;
}

export function updateVisitorUser(user) {
  if (!user) return;
  const visitors = getVisitors();
  const sessionId = sessionStorage.getItem('curepulse_session_id');
  if (!sessionId) return;
  const session = visitors.find(s => s.sessionId === sessionId);
  if (session) {
    session.user = { name: user.name, email: user.email, role: user.role };
    saveVisitors(visitors);
  }
}

export function clearAllVisitors() {
  localStorage.removeItem(VISITOR_KEY);
}
