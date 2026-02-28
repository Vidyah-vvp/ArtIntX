/**
 * ArtIntX API Configuration
 * This script centralizes the API URL to make it easier to switch between development and production.
 */

const API_DEV = 'http://localhost:5000';
// REPLACE the URL below with your actual Render URL after your backend is deployed!
// Example: https://artintx-api.onrender.com
const API_PROD = 'https://artintx-backend.onrender.com';

// Auto-detect production environment (if not localhost)
const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const BASE_URL = isProd ? API_PROD : API_DEV;

window.API_URL = `${BASE_URL}/api`;

console.log(`[ArtIntX] Base URL: ${BASE_URL}`);
console.log(`[ArtIntX] API Endpoint: ${window.API_URL}`);
