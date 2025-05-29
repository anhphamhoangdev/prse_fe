export const ENDPOINTS = {
    HOME: {
        BANNERS: '/home/banners',
        CATEGORIES: '/home/categories',
        FREE_COURSES: '/home/free-courses',
        DISCOUNT_COURSES: '/home/discount-courses',
        HOT_COURSES: '/home/hot-courses',
        RECOMMENDED_COURSES: '/home/recommendation-courses',
    },
    CATEGORY: {
        BY_SUBCATEGORY: '/category'
    },

    SEARCH: {
        SEARCH_BY_FILTER: '/search/filters'
    },

    STUDENT: {
        CHECK_USERNAME: '/student/existsByUsername',
        CHECK_EMAIL: '/student/existsByEmail',
        CHECK_PHONE_NUMBER: '/student/existsByPhoneNumber',
        REGISTER: '/student/register',
        ACTIVATE_ACCOUNT: '/student/activate',
        LOGIN: '/student/login',
        PROFILE: '/student/profile',
        UPDATE_AVATAR: '/student/update-avatar',
        UPDATE_PASSWORD: '/student/update-password',
    },

    INSTRUCTOR: {
        COURSES: '/instructor/courses',
        PROFILE: '/instructor/profile',
        REVENUE: '/instructor/revenue',
        UPLOAD_STATUS: '/instructor/upload-status',
        RECENT_ENROLLMENT : '/instructor/recent-enrollments',
        UPLOAD_COURSE : '/instructor/upload-course',
        UPLOAD_PREVIEW_VIDEO: '/instructor/upload-preview-video',
        UPDATE_PROFILE: '/instructor/update-profile',
        WITHDRAW_BANK: '/instructor/withdraw-bank',
        WITHDRAW_STUDENT_ACCOUNT: '/instructor/withdraw-student-account',
        COMMON_TITLES: "/instructor/common-titles",
        UPDATE_AVATAR: '/instructor/update-avatar',
        WITHDRAW_GET_ALL: '/instructor/withdraw/get-all',
    },


    COURSE: {
        BASIC: '/course',
        MY_COURSES: '/course/my-courses',
        TEST: '/test',

    },

    CART: {
        BASIC: '/cart',
        REMOVE_ITEM: '/cart/remove-course',
        COUNT: '/cart/count'
    },

    CHECKOUT: {
        CREATE: '/checkout/create',
    },

    PAYMENT: {
        GET_ALL_METHODS: '/payment-method',
        CREATE: '/payment/create',
        UPDATE_STATUS: '/payment/update-status',
        UPDATE_STATUS_INSTRUCTOR: '/payment/update-status-instructor',
        CREATE_INSTRUCTOR: '/payment/create-instructor',
        GET_ALL : '/payment/get-all-payment-log'

    },

    CHAT: {
        CHAT: '/chat',
    },

    WEBSOCKET: {
        // CONNECT: `https://${process.env.REACT_APP_BASE_IP}:8443/ws`,
        CONNECT: `${process.env.REACT_APP_WEBSOCKET}`,
    },

    ADMIN: {
        PROFILE: '/admin/profile',
        LOGIN: '/admin/login',
        OVERVIEW: '/admin/overview',
        STUDENTS: '/admin/students',
        REVENUE: '/admin/revenue',
        CATEGORY_DISTRIBUTION: '/admin/category-distribution',
        WITHDRAWS: '/admin/withdraws', INSTRUCTORS: '/admin/instructors',
        TICKETS: '/admin/tickets',
        INVOICE: '/admin/invoices',
        COURSES: '/admin/courses',
        PROCESS_STATISTIC: '/admin/dashboard/process_statistics',
        CATEGORIES: '/admin/categories',
        LESSONS_DRAFT: '/admin/lessons-draft',
        VIDEO_LESSONS_DRAFT: '/admin/video-lessons-draft',

    },

    BANK: {
        BASIC: '/banks',
    }

    ,

    QUIZ: {
        BASIC: '/quiz',
        SUBMIT: '/quiz/submit',
        GET_QUIZ_HISTORY: '/quiz/history',
    },

    CERTIFICATE : {
        GENERATE_CERTIFICATE: '/certificate/generate',
        PULIC: '/certificate/public',
    },

    ENROLLMENT : {
        STATS : '/enrollment/stats',
    },

    TICKET : {

        CREATE: '/ticket/create',
        GET_ALL: '/ticket/get-all',
        GET_BY_ID: '/ticket/get-by-id',
        UPDATE_STATUS: '/ticket/update-status',
        REPLY: '/ticket/reply',
    }




    // USER: {
    //     PROFILE: '/user/profile',
    //     SETTINGS: '/user/settings',
    // },
    // PRODUCT: {
    //     LIST: '/products',
    //     DETAIL: (id: number) => `/products/${id}`,
    // },
    // // ... các endpoints khác
} as const;