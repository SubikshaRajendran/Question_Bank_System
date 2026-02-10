// Basic API wrapper to handle JSON responses and errors
export const fetchApi = async (endpoint, options = {}) => {
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`/api${endpoint}`, config);

        // Handle 204 No Content
        if (response.status === 204) return null;

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};
