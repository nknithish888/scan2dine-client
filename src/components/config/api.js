import axios from 'axios';

// API Base URLs for different environments
const API_URLS = {
    development: 'http://localhost:3001/api',
    production: 'https://www.sslotteryagency.com/api',
};

// Automatically detect environment
const API_BASE_URL = import.meta.env.MODE === 'production'
    ? API_URLS.production
    : API_URLS.development;

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add a request interceptor to include the JWT token in headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ============================================
// AUTHENTICATION API
// ============================================
export const authAPI = {
    // Login
    login: (credentials) => api.post('/auth/login', credentials),

    // SuperAdmin - Restaurant Management
    addRestaurant: (data) => api.post('/auth/superadmin/add-restaurant', data),
    getAllRestaurants: () => api.get('/auth/superadmin/restaurants'),
    getRestaurantDetails: (id) => api.get(`/auth/superadmin/restaurants/${id}`),
    getRestaurantProducts: (id) => api.get(`/auth/superadmin/restaurants/${id}/products`),
    getRestaurantStaff: (id) => api.get(`/auth/superadmin/restaurants/${id}/staff`),
    getRestaurantAnalytics: (id) => api.get(`/auth/superadmin/restaurants/${id}/analytics`),
    updatePaymentStatus: (id, data) => api.patch(`/auth/superadmin/restaurants/${id}/payment`, data)``,
    updateDueDate: (id, data) => api.patch(`/auth/superadmin/restaurants/${id}/due-date`, data),
    toggleRestaurantStatus: (id) => api.patch(`/auth/superadmin/restaurants/${id}/toggle-status`),
    deleteRestaurant: (id) => api.delete(`/auth/superadmin/restaurants/${id}`),
    updateRestaurantPassword: (userId, data) => api.patch(`/auth/superadmin/restaurants/password/${userId}`, data),
    updateRestaurantPlan: (id, data) => api.patch(`/auth/superadmin/restaurants/${id}/plan`, data),
};

// ============================================
// MENU API
// ============================================
export const menuAPI = {
    // Get menu items for authenticated restaurant
    getMyMenu: () => api.get('/menu'),

    // Public menu access (no auth required)
    getPublicMenu: (restaurantSlug) => api.get(`/menu/public/${restaurantSlug}`),

    // Add menu item with image
    addMenuItem: (formData) => api.post('/menu', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Update menu item with optional image
    updateMenuItem: (id, formData) => api.put(`/menu/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Delete menu item
    deleteMenuItem: (id) => api.delete(`/menu/${id}`),

    // Toggle item availability
    toggleAvailability: (id, item) => api.put(`/menu/${id}`, item),
};

// ============================================
// ORDER API
// ============================================
export const orderAPI = {
    // Get all orders
    getOrders: () => api.get('/orders'),

    // Get live/active orders
    getLiveOrders: () => api.get('/orders/live'),

    // Get order statistics
    getOrderStats: () => api.get('/orders/stats'),

    // Create order (public - from QR code)
    createOrder: (orderData) => api.post('/orders', orderData),

    // Update order status or payment
    updateOrder: (orderId, updateData) => api.put(`/orders/${orderId}`, updateData),

    // Delete order
    deleteOrder: (orderId) => api.delete(`/orders/${orderId}`),
};

// ============================================
// STAFF API
// ============================================
export const staffAPI = {
    // Get all staff members
    getStaff: () => api.get('/staff'),

    // Get all managers
    getManagers: () => api.get('/staff/managers'),

    // Add staff member
    addStaff: (staffData) => api.post('/staff', staffData),

    // Update staff member
    updateStaff: (id, staffData) => api.put(`/staff/${id}`, staffData),

    // Delete staff member
    deleteStaff: (id) => api.delete(`/staff/${id}`),

    // Toggle manager status (activate/deactivate)
    toggleManagerStatus: (id) => api.patch(`/staff/managers/${id}/toggle-status`),
};

// ============================================
// CUSTOMER API
// ============================================
export const customerAPI = {
    // Get all customers
    getCustomers: () => api.get('/customers'),

    // Get customer statistics
    getCustomerStats: () => api.get('/customers/stats'),

    // Add customer (public - from QR code)
    addCustomer: (customerData) => api.post('/customers', customerData),

    // Update customer
    updateCustomer: (id, customerData) => api.put(`/customers/${id}`, customerData),

    // Delete customer
    deleteCustomer: (id) => api.delete(`/customers/${id}`),
};

// ============================================
// TABLE API
// ============================================
export const tableAPI = {
    // Get all tables
    getTables: () => api.get('/tables'),

    // Create table
    createTable: (tableData) => api.post('/tables', tableData),

    // Update table
    updateTable: (id, tableData) => api.put(`/tables/${id}`, tableData),

    // Delete table
    deleteTable: (id) => api.delete(`/tables/${id}`),
};

// ============================================
// EXPENSE API
// ============================================
export const expenseAPI = {
    // Get all expenses
    getExpenses: () => api.get('/expenses'),

    // Add expense
    addExpense: (expenseData) => api.post('/expenses', expenseData),

    // Update expense
    updateExpense: (id, expenseData) => api.put(`/expenses/${id}`, expenseData),

    // Delete expense
    deleteExpense: (id) => api.delete(`/expenses/${id}`),
};

// ============================================
// REPORT API
// ============================================
export const reportAPI = {
    // Get profit report with period filter
    getProfitReport: (period) => api.get(`/reports/profit?period=${period}`),

    // Get expense breakdown with period filter
    getExpenseBreakdown: (period) => api.get(`/reports/expense-breakdown?period=${period}`),

    // Get top selling items with period filter
    getTopSellingItems: (period) => api.get(`/reports/top-items?period=${period}`),
};

// ============================================
// FEEDBACK API
// ============================================
export const feedbackAPI = {
    // Submit feedback with images (public)
    submitFeedback: (formData) => api.post('/feedback/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Get restaurant info by slug (public)
    getRestaurantInfo: (slug) => api.get(`/feedback/info/${slug}`),

    // Generate feedback QR code
    generateFeedbackQR: (baseUrl) => api.get(`/feedback/generate-qr?baseUrl=${baseUrl}`),

    // Get all feedback for restaurant
    getAllFeedback: () => api.get('/feedback/all'),

    // Get customer emails for newsletter
    getFeedbackEmails: () => api.get('/feedback/emails'),

    // Send newsletter
    sendNewsletter: (newsletterData) => api.post('/feedback/newsletter/send', newsletterData),
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
export const utils = {
    // Get base URL for image display
    getImageUrl: (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return api.defaults.baseURL.replace('/api', '') + path;
    },

    // Clear authentication
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Get current user
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};

// Export the base axios instance for custom requests
export default api;
export { API_BASE_URL };
