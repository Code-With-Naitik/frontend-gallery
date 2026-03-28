const config = {
  // Use your BACKEND URL here (e.g., https://backend-gallery-seven.vercel.app/)
  // NOT your Frontend URL (https://frontend-gallery-delta.vercel.app/)
  API_BASE_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.'))
    ? `http://${window.location.hostname}:8001`
    : import.meta.env.VITE_API_URL || 'https://backend-gallery-seven.vercel.app',
};

export default config;
