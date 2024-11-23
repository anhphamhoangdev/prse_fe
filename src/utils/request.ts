
const BASE_URL = `https://${process.env.REACT_APP_BASE_IP}:8443/api`;

interface RequestParams {
    [key: string]: string | number | boolean | undefined;
}

// GET
export async function request<T>(endpoint: string): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    return response.json();
}


// POST WITH BODY
export async function requestPost<T>(endpoint: string, data: any): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    console.log(url);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to post to ${url}: ${response.statusText}`);
    }

    return response.json();
}

// GET WITH AUTHENTICATION
export async function requestWithAuth<T>(endpoint: string): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const token = localStorage.getItem('token') || sessionStorage.getItem("token");
    if (!token) {
        window.location.href = '/login';
        return Promise.reject();
    }

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem("token");
        window.location.href = '/login';
        return Promise.reject();
    }

    if(response.status === 403) {
        window.location.href = '/forbidden';
        return Promise.reject();
    }

    if(response.status === 404) {
        window.location.href = '/not-found';
        return Promise.reject();
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const jsonResponse = await response.json();

    // Check response code từ API
    if (jsonResponse.code === 0) {
        throw new Error(jsonResponse.error_message);
    }
    return jsonResponse.data; // Trả về data
}

// POST WITH AUTHENTICATION
export async function requestPostFormDataWithAuth<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const token = localStorage.getItem('token') || sessionStorage.getItem("token");

    if (!token) {
        window.location.href = '/login';
        return Promise.reject();
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem("token");
        window.location.href = '/login';
        return Promise.reject();
    }

    if (!response.ok) {
        throw new Error(`Failed to post to ${url}: ${response.statusText}`);
    }

    const jsonResponse = await response.json();

    // Check response code từ API
    if (jsonResponse.code === 0) {
        throw new Error(jsonResponse.error_message);
    }

    return jsonResponse.data;
}


// GET WITH AUTHENTICATION OR NOT
export async function requestGetWithOptionalAuth<T>(endpoint: string): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`[Request] Fetching ${url}`);

    // Check for token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    // Prepare headers
    const headers: Record<string, string> = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`Request failed with status: ${response.status}`);
        }

        const jsonResponse = await response.json();
        return jsonResponse;

    } catch (error) {
        console.error('[Request] Error during fetch:', error);
        throw error;
    }
}


// GET WITH PARAM
export async function requestWithParams<T>(endpoint: string, params?: RequestParams): Promise<T> {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${BASE_URL}${normalizedEndpoint}`);

    // Add query parameters if they exist
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                url.searchParams.append(key, value.toString());
            }
        });
    }

    console.log(`[Request] Fetching with params:`, url.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    return response.json();
}

export async function requestPostWithAuth<T>(endpoint: string, data: any): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const token = localStorage.getItem('token') || sessionStorage.getItem("token");
    if (!token) {
        window.location.href = '/login';
        return Promise.reject();
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem("token");
        window.location.href = '/login';
        return Promise.reject();
    }

    if(response.status === 403) {
        window.location.href = '/forbidden';
        return Promise.reject();
    }

    if(response.status === 404) {
        window.location.href = '/not-found';
        return Promise.reject();
    }

    if (!response.ok) {
        throw new Error(`Failed to post to ${url}: ${response.statusText}`);
    }

    const jsonResponse = await response.json();

    // Check response code từ API
    if (jsonResponse.code === 0) {
        throw new Error(jsonResponse.error_message);
    }

    return jsonResponse.data;
}

export async function requestPostWithAuthFullResponse<T>(endpoint: string, data: any): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const token = localStorage.getItem('token') || sessionStorage.getItem("token");
    if (!token) {
        window.location.href = '/login';
        return Promise.reject();
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem("token");
        window.location.href = '/login';
        return Promise.reject();
    }

    if(response.status === 403) {
        window.location.href = '/forbidden';
        return Promise.reject();
    }

    if(response.status === 404) {
        window.location.href = '/not-found';
        return Promise.reject();
    }

    if (!response.ok) {
        throw new Error(`Failed to post to ${url}: ${response.statusText}`);
    }

    const jsonResponse = await response.json();

    // Check response code từ API
    if (jsonResponse.code === 0) {
        throw new Error(jsonResponse.error_message);
    }

    return jsonResponse;
}



// delete
export async function requestDelete<T>(endpoint: string): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const token = localStorage.getItem('token') || sessionStorage.getItem("token");
    if (!token) {
        window.location.href = '/login';
        return Promise.reject();
    }

    const response = await fetch(url, {
        method: 'DELETE',  // Sử dụng DELETE method
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem("token");
        window.location.href = '/login';
        return Promise.reject();
    }

    if(response.status === 403) {
        window.location.href = '/forbidden';
        return Promise.reject();
    }

    if(response.status === 404) {
        window.location.href = '/not-found';
        return Promise.reject();
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const jsonResponse = await response.json();

    if (jsonResponse.code === 0) {
        throw new Error(jsonResponse.error_message);
    }
    return jsonResponse;
}