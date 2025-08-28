import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

// Types based on the API response
export interface CaseStatsByStage {
	stage: string;
	count: number;
}

export interface CaseStats {
	_id: string | null;
	total: number;
	pending: number;
	approved: number;
	rejected: number;
	closed: number;
	byStage: CaseStatsByStage[];
}

export interface CaseStatsResponse {
	message: string;
	data: CaseStats;
	success: boolean;
	status: number;
	timestamp: string;
	cache: boolean;
}

// Case Statistics Overview
export const useCaseStats = () => {
	return useQuery({
		queryKey: ["overview", "case-stats"],
		queryFn: async (): Promise<CaseStatsResponse> => {
			const response = await axiosInstance.get("/v1/cases/stats/overview");
			return response.data;
		},
	});
};

// All Cases for Overview
export const useAllCases = (
	params: {
		page?: number;
		limit?: number;
		status?: string;
		sortBy?: string;
		sortDirection?: "asc" | "desc";
		search?: string;
	} = {}
) => {
	return useQuery({
		queryKey: ["overview", "all-cases", params],
		queryFn: async () => {
			const searchParams = new URLSearchParams();

			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null && value !== "") {
					searchParams.append(key, value.toString());
				}
			});

			const response = await axiosInstance.get(
				`/v1/cases?${searchParams.toString()}`
			);
			return response.data;
		},
	});
};
