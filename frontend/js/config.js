(function () {
  // Allow overriding API base via window.MM_API_URL or a window.env block injected by the host.
  const injected = (window.env && window.env.API_URL) || window.MM_API_URL;
  const fallback = 'http://localhost:5000/api';
  window.MM_CONFIG = {
    API_URL: injected || fallback
  };
})();
