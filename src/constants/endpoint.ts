export const ENDPOINTS = {
    HOME: {
        BANNERS: '/home/banners',
        CATEGORIES: '/home/categories',
        FREE_COURSES: '/home/free-courses',
        DISCOUNT_COURSES: '/home/discount-courses'
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
        CHECK_PHONENUMBER: '/student/existsByPhoneNumber',
        REGISTER: '/student/register',
        ACTIVATE_ACCOUNT: '/student/activate',
        LOGIN: '/student/login',
        PROFILE: '/student/profile'
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