export const ENDPOINTS = {
    HOME: {
        BANNERS: '/home/banners',
        CATEGORIES: '/home/categories',
        FREE_COURSES: '/home/free-courses',
        DISCOUNT_COURSES: '/home/discount-courses',
        HOT_COURSES: '/home/hot-courses',
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
    },

    INSTRUCTOR: {
        PROFILE: '/instructor/profile',
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