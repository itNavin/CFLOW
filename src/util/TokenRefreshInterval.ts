import { Axios } from "./AxiosInstance";

let refreshInterval: NodeJS.Timeout | null = null;

const startTokenRefresh = () => {
    if (refreshInterval) return; // Already running

    console.log('Starting token refresh');

    refreshInterval = setInterval(async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            stopTokenRefresh();
            return;
        }

        try {
            await Axios.get('/auth/verify');
        } catch (error) {
            console.error('Token refresh failed:', error);
            stopTokenRefresh();
        }
    }, 60000); // 1 minute
};

const stopTokenRefresh = () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
};

export { startTokenRefresh, stopTokenRefresh };