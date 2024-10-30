
const BASE_URL = `http://${process.env.REACT_APP_BASE_IP}:8080/api`;


export async function request<T>(endpoint: string): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    console.log(url)
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    return response.json();
}