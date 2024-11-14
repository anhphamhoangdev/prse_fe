
const BASE_URL = `https://${process.env.REACT_APP_BASE_IP}:8443/api`;


export async function request<T>(endpoint: string): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    console.log(url)
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    return response.json();
}

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

    if (!response.ok) {
        throw new Error(`Failed to post to ${url}: ${response.statusText}`);
    }

    return response.json();
}