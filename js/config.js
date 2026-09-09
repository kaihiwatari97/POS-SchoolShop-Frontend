//const API = 'https://pos-schoolshop-api-production-6de5.up.railway.app';
//const API = 'localhost:8080';
const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8080'
  : 'https://pos-schoolshop-api-production-6de5.up.railway.app';