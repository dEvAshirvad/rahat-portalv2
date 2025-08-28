import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

// Types
export interface CreateUserData {
	email: string;
	password: string;
	name: string;
	data: {
		rahatRole: string;
		jurisdiction?: string;
	};
}

export interface CreateUserResponse {
	user: {
		id: string;
		name: string;
		email: string;
		emailVerified: boolean;
		createdAt: string;
		updatedAt: string;
		role: string;
		rahatRole: string;
		jurisdiction?: string;
	};
}

export interface User {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	createdAt: string;
	updatedAt: string;
	role: string;
	rahatRole: string;
	jurisdiction?: string;
	banned?: boolean;
	banReason?: string;
	banExpires?: string;
}

export interface ListUsersResponse {
	users: User[];
	total: number;
}

export interface ListUsersParams {
	searchValue?: string;
	searchField?: "email" | "name";
	searchOperator?: "contains" | "starts_with" | "ends_with";
	limit?: number;
	offset?: number;
	sortBy?: string;
	sortDirection?: "asc" | "desc";
	filterField?: string;
	filterValue?: string | number | boolean;
	filterOperator?: "eq" | "ne" | "lt" | "lte" | "gt" | "gte";
}

export interface UpdateUserData {
	userId: string;
	data: {
		email?: string;
		name?: string;
		rahatRole?: string;
		jurisdiction?: string;
	};
}

export interface ListSessionsData {
	userId: string;
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
	impersonatedBy?: string;
}

export interface ListSessionsResponse {
	sessions: Session[];
}

export interface BanUserData {
	userId: string;
	banReason: string;
	banExpiresIn?: string; // ISO duration string like "P30D" for 30 days
}

export interface BanUserResponse {
	user: User;
}

export interface SetPasswordData {
	userId: string;
	newPassword: string;
}

export interface SetPasswordResponse {
	status: boolean;
}

// Create User
export const useCreateUserMutation = () => {
	return useMutation({
		mutationFn: async (data: CreateUserData): Promise<CreateUserResponse> => {
			const response = await axiosInstance.post(
				"/auth/admin/create-user",
				data
			);
			return response.data;
		},
	});
};

// List Users
export const useListUsers = (params: ListUsersParams = {}) => {
	return useQuery({
		queryKey: ["admin", "users", params],
		queryFn: async (): Promise<ListUsersResponse> => {
			const searchParams = new URLSearchParams();

			// Add all parameters to search params
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null && value !== "") {
					searchParams.append(key, value.toString());
				}
			});

			const response = await axiosInstance.get(
				`/auth/admin/list-users?${searchParams.toString()}`
			);
			return response.data;
		},
	});
};

// Update User
export const useUpdateUserMutation = () => {
	return useMutation({
		mutationFn: async (data: UpdateUserData): Promise<User> => {
			const response = await axiosInstance.post(
				"/auth/admin/update-user",
				data
			);
			return response.data;
		},
	});
};

// List User Sessions
export const useListUserSessions = (userId: string) => {
	return useQuery({
		queryKey: ["admin", "sessions", userId],
		queryFn: async (): Promise<ListSessionsResponse> => {
			const response = await axiosInstance.post(
				"/auth/admin/list-user-sessions",
				{
					userId,
				}
			);
			return response.data;
		},
		enabled: !!userId,
	});
};

// Ban User
export const useBanUserMutation = () => {
	return useMutation({
		mutationFn: async (data: BanUserData): Promise<BanUserResponse> => {
			const response = await axiosInstance.post("/auth/admin/ban-user", data);
			return response.data;
		},
	});
};

// Set User Password
export const useSetUserPasswordMutation = () => {
	return useMutation({
		mutationFn: async (data: SetPasswordData): Promise<SetPasswordResponse> => {
			const response = await axiosInstance.post(
				"/auth/admin/set-user-password",
				data
			);
			return response.data;
		},
	});
};
