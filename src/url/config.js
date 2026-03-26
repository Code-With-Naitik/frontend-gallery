const config = {
  API_BASE_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8001'
    : import.meta.env.VITE_API_URL || 'https://frontend-gallery-beta.vercel.app' || 'https://api.prompt-gallery.com',
};

export default config;
