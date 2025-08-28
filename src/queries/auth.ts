import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Types
export interface SignInCredentials {
	email: string;
	password: string;
	rememberMe: boolean;
}

export interface SignInResponse {
	redirect: boolean;
	token: string;
	user: {
		id: string;
		email: string;
		name: string;
		emailVerified: boolean;
		createdAt: string;
		updatedAt: string;
	};
}

export interface SignOutResponse {
	success: boolean;
}

export interface Session {
	id: string;
	expiresAt: string;
	token: string;
	createdAt: string;
	updatedAt: string;
	ipAddress: string;
	userAgent: string;
	userId: string;
	impersonatedBy: string;
}

export interface User {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string;
	createdAt: string;
	updatedAt: string;
	role: string;
	banned: boolean;
	banReason: string;
	banExpires: string;
	rahatRole: string;
	jurisdiction: string;
}

export interface GetSessionResponse {
	session: Session;
	user: User;
}

export interface ApiError {
	code?: string;
	message?: string;
}

// Auth API functions
export const authApi = {
	signIn: async (credentials: SignInCredentials): Promise<SignInResponse> => {
		try {
			const response = await api.post<SignInResponse>(
				"/auth/sign-in/email",
				credentials
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	signOut: async (): Promise<SignOutResponse> => {
		try {
			const response = await api.post<SignOutResponse>("/auth/sign-out", {});
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getSession: async (): Promise<GetSessionResponse> => {
		try {
			const response = await api.get<GetSessionResponse>("/auth/get-session");
			return response.data;
		} catch (error) {
			throw error;
		}
	},
};

// React Query hooks
export const useSignIn = () => {
	const queryClient = useQueryClient();
	return useMutation<SignInResponse, ApiError, SignInCredentials>({
		mutationFn: authApi.signIn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["session"] });
		},
		onError: () => {},
	});
};

export const useSignOut = () => {
	const queryClient = useQueryClient();
	const router = useRouter();
	return useMutation<SignOutResponse, ApiError>({
		mutationFn: authApi.signOut,
		onSuccess: (data) => {
			// Handle successful sign out
			toast("Signed out successfully");
			//clear all queries
			queryClient.clear();
			router.push("/signin");
		},
		onError: (error) => {
			// Handle sign out error
			console.error("Sign out failed:", error);
		},
	});
};

export const useSession = () => {
	return useQuery<GetSessionResponse, ApiError>({
		queryKey: ["session"],
		queryFn: authApi.getSession,
		retry: false, // Don't retry on 401/400 errors
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};
