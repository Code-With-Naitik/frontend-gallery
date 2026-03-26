const config = {
  // Use your BACKEND URL here (e.g., https://your-backend.vercel.app)
  // NOT your Frontend URL (https://frontend-gallery-beta.vercel.app)
  API_BASE_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8001'
    : import.meta.env.VITE_API_URL || 'https://api.prompt-gallery.com',
};

export default config;
