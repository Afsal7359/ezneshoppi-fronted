import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: false,
  timeout: 0, // no timeout — let server respond at its own pace
});

// Attach auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('etrade_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      // token invalid — page controllers handle redirect
    }
    return Promise.reject(err);
  }
);

export default api;

/* ---------- Simple in-memory cache for read-heavy endpoints ---------- */
const cache = new Map(); // key → { data, ts }

function cached(key, fn, ttlMs = 30_000) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < ttlMs) return Promise.resolve(hit.data);
  return fn().then((res) => {
    cache.set(key, { data: res, ts: Date.now() });
    return res;
  });
}

// Bust settings cache when admin saves
export function bustSettingsCache() {
  cache.delete('settings');
}

/* -------- endpoint helpers -------- */
export const API = {
  // auth
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  sendOtp: (email) => api.post('/api/auth/send-otp', { email }),
  verifyOtp: (data) => api.post('/api/auth/verify-otp', data),   // { email, otp, name? }
  googleAuth: (token) => api.post('/api/auth/google', { access_token: token }),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/api/auth/reset-password', data), // { email, otp, password }
  me: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  addAddress: (data) => api.post('/api/auth/addresses', data),
  updateAddress: (id, data) => api.put(`/api/auth/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/api/auth/addresses/${id}`),
  toggleWishlist: (pid) => api.post(`/api/auth/wishlist/${pid}`),

  // products
  products: (params) => api.get('/api/products', { params }),
  product: (key) => api.get(`/api/products/${key}`),
  relatedProducts: (id) => api.get(`/api/products/related/${id}`),
  createProduct: (data) => api.post('/api/products', data),
  updateProduct: (id, data) => api.put(`/api/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/api/products/${id}`),

  // categories — cache for 60s (rarely changes)
  categories: (params) =>
    cached(`categories-${JSON.stringify(params)}`, () => api.get('/api/categories', { params }), 60_000),

  createCategory: (data) => {
    cache.clear(); // invalidate all on mutation
    return api.post('/api/categories', data);
  },
  updateCategory: (id, data) => {
    cache.clear();
    return api.put(`/api/categories/${id}`, data);
  },
  deleteCategory: (id) => {
    cache.clear();
    return api.delete(`/api/categories/${id}`);
  },

  // orders
  createOrder: (data) => api.post('/api/orders', data),
  verifyPayment: (data) => api.post('/api/orders/verify-payment', data),
  myOrders: () => api.get('/api/orders/my'),
  getOrder: (id) => api.get(`/api/orders/${id}`),
  allOrders: (params) => api.get('/api/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/api/orders/${id}/status`, data),

  // coupons
  validateCoupon: (data) => api.post('/api/coupons/validate', data),
  coupons: (params) => api.get('/api/coupons', { params }),
  createCoupon: (data) => api.post('/api/coupons', data),
  updateCoupon: (id, data) => api.put(`/api/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/api/coupons/${id}`),

  // reviews
  productReviews: (pid) => api.get(`/api/reviews/product/${pid}`),
  canReviewProduct: (pid) => api.get(`/api/reviews/can-review/${pid}`),
  createReview: (data) => api.post('/api/reviews', data),
  // admin reviews
  adminListReviews: (pid) => api.get(`/api/reviews/admin/product/${pid}`),
  adminCreateReview: (data) => api.post('/api/reviews/admin', data),
  adminUpdateReview: (id, data) => api.put(`/api/reviews/admin/${id}`, data),
  deleteReview: (id) => api.delete(`/api/reviews/${id}`),

  // settings — cache for 30s so Header/Footer don't both fire requests
  settings: () => cached('settings', () => api.get('/api/settings'), 30_000),
  updateSettings: (data) => {
    cache.delete('settings');
    return api.put('/api/settings', data);
  },

  // users
  users: (params) => api.get('/api/users', { params }),
  updateUser: (id, data) => api.put(`/api/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/users/${id}`),

  // blog
  blogs: (params) => api.get('/api/blog', { params }),
  blog: (slug) => api.get(`/api/blog/${slug}`),
  createBlog: (data) => api.post('/api/blog', data),
  updateBlog: (id, data) => api.put(`/api/blog/${id}`, data),
  deleteBlog: (id) => api.delete(`/api/blog/${id}`),

  // admin
  stats: () => api.get('/api/admin/stats'),

  // upload
  uploadSingle: (formData) =>
    api.post('/api/uploads/single', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadMultiple: (formData) =>
    api.post('/api/uploads/multiple', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
