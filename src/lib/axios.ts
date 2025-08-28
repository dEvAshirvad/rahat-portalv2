import axios from "axios";

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL + "/api",
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor
api.interceptors.request.use(
	(config) => {
		// You can add any request logging or modifications here
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor
// api.interceptors.response.use(
// 	(response) => {
// 		return response;
// 	},
// 	(error) => {
// 		return Promise.reject(error);
// 	}
// );

export default api;
