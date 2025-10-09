import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

// Types
export interface Victim {
	name: string;
	dob: string;
	dod: string;
	address: string;
	description: string;
	relative: {
		name: string;
		contact: string;
		relation: string;
	};
}

export interface Document {
	fileId: {
		_id: string;
		originalName: string;
		filename: string;
		mimetype: string;
	};
	type: "patwari-inspection" | "postmortem-report" | "inspection-report";
}

export interface Payment {
	_id: string;
	status: string;
	amount: number;
	remark: string;
}

export interface Remark {
	stage: number;
	remark: string;
	userId: string;
	date: string;
	_id: string;
}

export interface RoleUserMap {
	tehsildar?: string;
	"thana-incharge"?: string;
	sdm?: string;
	"rahat-shakha"?: string;
	oic?: string;
	"additional-collector"?: string;
	collector?: string;
}

export interface Case {
	_id: string;
	roleUserMap: RoleUserMap;
	victim: Victim;
	stage: string;
	status: string;
	currentRoles: string[];
	documents: Document[];
	paymentId: Payment | null;
	createdBy: string;
	remarks: Remark[];
	caseId: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}

export interface CreateCaseRequest {
	caseType: "unnatural-death" | "hit-and-run";
	victim: Victim;
	thanaInchargeId: string;
}

export interface CreateCaseResponse {
	message: string;
	data: {
		caseId: string;
		roleUserMap: RoleUserMap;
		victim: Victim;
		stage: string;
		status: string;
		currentRoles: string[];
		remarks: Remark[];
	};
}

export interface CasesResponse {
	message: string;
	data: {
		docs: Case[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
	success: boolean;
	status: number;
	timestamp: string;
	cache: boolean;
}

export interface PendingCasesResponse {
	message: string;
	data: {
		docs: Case[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
	success: boolean;
	status: number;
	timestamp: string;
	cache: boolean;
}

export interface SingleCaseResponse {
	message: string;
	data: Case;
	success: boolean;
	status: number;
	timestamp: string;
	cache: boolean;
}

export interface WorkflowStatusResponse {
	message: string;
	data: {
		caseId: string;
		stage: string;
		status: string;
		currentRoles: string[];
		availableActions: string[];
		nextStage: string;
		canProceed: boolean;
	};
}

export interface WorkflowUpdateRequest {
	action: "forward" | "approve" | "reject" | "terminate" | "release_notice";
	remark?: string;
}

export interface WorkflowUpdateResponse {
	message: string;
	data: {
		caseId: string;
		stage: string;
		status: string;
		currentRoles: string[];
		remarks: Remark[];
	};
}

// File upload interfaces
export interface FileUploadRequest {
	file: File;
	uploadedFor: string;
	entityType: string;
	description: string;
	tags: string;
	isPublic: boolean;
}

export interface FileUploadResponse {
	message: string;
	data: {
		id: string;
		originalName: string;
		filename: string;
		mimetype: string;
		size: number;
		uploadedBy: string;
		uploadedFor: string;
		entityType: string;
		description: string;
		tags: string[];
		isPublic: boolean;
		createdAt: string;
		updatedAt: string;
		canAccess: boolean;
		canDownload: boolean;
		compressionInfo: {
			compressedPaths: string[];
			compressed: boolean;
			originalSize: number;
			compressionStatus: string;
			folderId: string;
		};
		fileByIdUrl: string;
		fileUrl: string;
		downloadUrl: string;
	};
	success: boolean;
	status: number;
	timestamp: string;
	cache: boolean;
}

export interface DocumentUploadRequest {
	documents: {
		fileId: string;
		documentType:
			| "patwari-inspection"
			| "postmortem-report"
			| "inspection-report";
	}[];
}

export interface DocumentUploadResponse {
	message: string;
	data: {
		caseId: string;
		documents: Document[];
		remarks: Remark[];
	};
}

export interface BeneficiaryDetails {
	name: string;
	accountNumber?: string;
	bankName?: string;
	ifscCode?: string;
}

export interface CloseCaseRequest {
	amount: number;
	remark?: string;
	paymentMethod?: "bank_transfer" | "cash" | "cheque" | "online";
	beneficiaryDetails: BeneficiaryDetails;
}

export interface CloseCaseResponse {
	message: string;
	data: {
		caseId: string;
		stage: string;
		status: string;
		paymentId: string;
		remarks: Remark[];
	};
}

export interface CaseStatsResponse {
	message: string;
	data: {
		total: number;
		pending: number;
		approved: number;
		rejected: number;
		closed: number;
		byStage: Array<{
			stage: string;
			count: number;
		}>;
	};
}

export interface WorkflowStage {
	stage: number;
	name: string;
	description: string;
	roles: string[];
	actions: string[];
	nextStage: string;
}

export interface WorkflowStagesResponse {
	message: string;
	data: WorkflowStage[];
}

export interface DocumentType {
	type: string;
	name: string;
	description: string;
	required: boolean;
	uploadedBy: string;
}

export interface DocumentTypesResponse {
	message: string;
	data: DocumentType[];
}

export interface ThanaIncharge {
	_id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	createdAt: string;
	updatedAt: string;
	role: string;
	rahatRole: string;
	jurisdiction: string;
}

export interface ThanaInchargeSearchResponse {
	message: string;
	data: {
		docs: ThanaIncharge[];
		totalDocs: number;
		page: number;
		limit: number;
		totalPages: number;
		nextPage: boolean;
		prevPage: boolean;
	};
	success: boolean;
	status: number;
	timestamp: string;
	cache: boolean;
}

export interface ReadyToCloseCasesResponse {
	message: string;
	data: {
		docs: Case[];
		totalDocs: number;
		page: number;
		limit: number;
		totalPages: number;
		nextPage: boolean;
		prevPage: boolean;
	};
	success: boolean;
	status: number;
	timestamp: string;
	cache: boolean;
}

export interface ApiError {
	title?: string;
	message?: string;
	error?: string;
	success?: boolean;
	status?: number;
	errors?: string[];
	meta?: Record<string, unknown>;
	timestamp?: string;
	cache?: boolean;
}

// Cases API functions
export const casesApi = {
	// Create a new case
	createCase: async (data: CreateCaseRequest): Promise<CreateCaseResponse> => {
		try {
			const response = await api.post<CreateCaseResponse>("/v1/cases", data);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Get all cases (collectors only)
	getAllCases: async (params?: {
		stage?: string;
		status?: string;
		createdBy?: string;
		page?: number;
		limit?: number;
		sortBy?: string;
		sortOrder?: "asc" | "desc";
	}): Promise<CasesResponse> => {
		try {
			const response = await api.get<CasesResponse>("/v1/cases", { params });
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Get pending cases for current user
	getPendingCases: async (params?: {
		page?: number;
		limit?: number;
	}): Promise<PendingCasesResponse> => {
		try {
			const response = await api.get<PendingCasesResponse>(
				"/v1/cases/my-pending",
				{ params }
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Get case by ID
	getCaseById: async (caseId: string): Promise<SingleCaseResponse> => {
		try {
			const response = await api.get<SingleCaseResponse>(`/v1/cases/${caseId}`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Get workflow status
	getWorkflowStatus: async (
		caseId: string
	): Promise<WorkflowStatusResponse> => {
		try {
			const response = await api.get<WorkflowStatusResponse>(
				`/v1/cases/${caseId}/workflow/status`
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Update workflow
	updateWorkflow: async (
		caseId: string,
		data: WorkflowUpdateRequest
	): Promise<WorkflowUpdateResponse> => {
		try {
			const response = await api.put<WorkflowUpdateResponse>(
				`/v1/cases/${caseId}/workflow`,
				data
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Upload documents
	uploadDocuments: async (
		caseId: string,
		data: DocumentUploadRequest
	): Promise<DocumentUploadResponse> => {
		try {
			const response = await api.post<DocumentUploadResponse>(
				`/v1/cases/${caseId}/documents`,
				data
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Upload file to static storage
	uploadFile: async (data: FileUploadRequest): Promise<FileUploadResponse> => {
		try {
			const formData = new FormData();
			formData.append("file", data.file);
			formData.append("uploadedFor", data.uploadedFor);
			formData.append("entityType", data.entityType);
			formData.append("description", data.description);
			formData.append("tags", data.tags);
			formData.append("isPublic", data.isPublic.toString());

			const response = await api.post<FileUploadResponse>(
				"/v1/files/static/upload",
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Close case
	closeCase: async (
		caseId: string,
		data: CloseCaseRequest
	): Promise<CloseCaseResponse> => {
		try {
			const response = await api.post<CloseCaseResponse>(
				`/v1/cases/${caseId}/close`,
				data
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Get case statistics
	getCaseStats: async (): Promise<CaseStatsResponse> => {
		try {
			const response = await api.get<CaseStatsResponse>(
				"/v1/cases/stats/overview"
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Get workflow stages
	getWorkflowStages: async (): Promise<WorkflowStagesResponse> => {
		try {
			const response = await api.get<WorkflowStagesResponse>(
				"/v1/cases/workflow/stages"
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Get document types
	getDocumentTypes: async (): Promise<DocumentTypesResponse> => {
		try {
			const response = await api.get<DocumentTypesResponse>(
				"/v1/cases/documents/types"
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Search thana incharge
	searchThanaIncharge: async (params?: {
		page?: number;
		limit?: number;
		q?: string;
	}): Promise<ThanaInchargeSearchResponse> => {
		try {
			const response = await api.get<ThanaInchargeSearchResponse>(
				"/v1/cases/search/thana-incharge",
				{ params }
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Get cases ready to close
	getReadyToCloseCases: async (params?: {
		page?: number;
		limit?: number;
		sortBy?: string;
		sortOrder?: "asc" | "desc";
	}): Promise<ReadyToCloseCasesResponse> => {
		try {
			console.log("Making API call to ready-to-close with params:", params);
			const response = await api.get<ReadyToCloseCasesResponse>(
				"/v1/cases/ready-to-close",
				{ params }
			);
			console.log("API response:", response.data);
			return response.data;
		} catch (error) {
			console.error("API error:", error);
			throw error;
		}
	},

	// Generate case PDF
	generateCasePDF: async (caseId: string): Promise<Blob> => {
		try {
			const response = await api.get(`/v1/cases/${caseId}/pdf`, {
				responseType: "blob",
			});
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Generate final case PDF
	generateFinalCasePDF: async (caseId: string): Promise<Blob> => {
		try {
			const response = await api.get(`/v1/cases/${caseId}/final-pdf`, {
				responseType: "blob",
			});
			return response.data;
		} catch (error) {
			throw error;
		}
	},
};

// React Query hooks
export const useAllCases = (params?: {
	stage?: string;
	status?: string;
	createdBy?: string;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}) => {
	return useQuery<CasesResponse, ApiError>({
		queryKey: ["cases", "all", params],
		queryFn: () => casesApi.getAllCases(params),
		retry: (failureCount, error) => {
			// Don't retry on 401 (unauthorized) or 403 (forbidden)
			if (error.status === 401 || error.status === 403) {
				return false;
			}
			return failureCount < 2;
		},
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
};

export const usePendingCases = (params?: { page?: number; limit?: number }) => {
	return useQuery<PendingCasesResponse, ApiError>({
		queryKey: ["cases", "pending", params],
		queryFn: () => casesApi.getPendingCases(params),
		retry: (failureCount, error) => {
			// Don't retry on 401 (unauthorized)
			if (error.status === 401) {
				return false;
			}
			return failureCount < 2;
		},
		staleTime: 1 * 60 * 1000, // 1 minute
		gcTime: 3 * 60 * 1000, // 3 minutes
	});
};

export const useCaseById = (caseId: string) => {
	return useQuery<SingleCaseResponse, ApiError>({
		queryKey: ["cases", caseId],
		queryFn: () => casesApi.getCaseById(caseId),
		enabled: !!caseId,
		retry: (failureCount, error) => {
			if (error.status === 404) {
				return false;
			}
			return failureCount < 2;
		},
		staleTime: 1 * 60 * 1000, // 1 minute
		gcTime: 3 * 60 * 1000, // 3 minutes
	});
};

export const useWorkflowStatus = (caseId: string) => {
	return useQuery<WorkflowStatusResponse, ApiError>({
		queryKey: ["cases", caseId, "workflow-status"],
		queryFn: () => casesApi.getWorkflowStatus(caseId),
		enabled: !!caseId,
		staleTime: 30 * 1000, // 30 seconds
		gcTime: 2 * 60 * 1000, // 2 minutes
	});
};

export const useCaseStats = () => {
	return useQuery<CaseStatsResponse, ApiError>({
		queryKey: ["cases", "stats"],
		queryFn: casesApi.getCaseStats,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

export const useWorkflowStages = () => {
	return useQuery<WorkflowStagesResponse, ApiError>({
		queryKey: ["cases", "workflow-stages"],
		queryFn: casesApi.getWorkflowStages,
		staleTime: 10 * 60 * 1000, // 10 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
	});
};

export const useDocumentTypes = () => {
	return useQuery<DocumentTypesResponse, ApiError>({
		queryKey: ["cases", "document-types"],
		queryFn: casesApi.getDocumentTypes,
		staleTime: 10 * 60 * 1000, // 10 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
	});
};

export const useThanaInchargeSearch = (params?: {
	page?: number;
	limit?: number;
	q?: string;
}) => {
	return useQuery<ThanaInchargeSearchResponse, ApiError>({
		queryKey: ["thana-incharge", "search", params],
		queryFn: () => casesApi.searchThanaIncharge(params),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

export const useReadyToCloseCases = (params?: {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}) => {
	return useQuery<ReadyToCloseCasesResponse, ApiError>({
		queryKey: ["cases", "ready-to-close", params],
		queryFn: () => casesApi.getReadyToCloseCases(params),
		retry: (failureCount, error) => {
			// Don't retry on 401 (unauthorized) or 403 (forbidden)
			if (error.status === 401 || error.status === 403) {
				return false;
			}
			return failureCount < 2;
		},
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Mutations
export const useCreateCase = () => {
	const queryClient = useQueryClient();

	return useMutation<CreateCaseResponse, ApiError, CreateCaseRequest>({
		mutationFn: casesApi.createCase,
		onSuccess: () => {
			// Invalidate and refetch cases queries
			queryClient.invalidateQueries({ queryKey: ["cases"] });
		},
	});
};

export const useUpdateWorkflow = () => {
	const queryClient = useQueryClient();

	return useMutation<
		WorkflowUpdateResponse,
		ApiError,
		{ caseId: string; data: WorkflowUpdateRequest }
	>({
		mutationFn: ({ caseId, data }) => casesApi.updateWorkflow(caseId, data),
		onSuccess: (data, variables) => {
			// Invalidate specific case and cases lists
			queryClient.invalidateQueries({ queryKey: ["cases", variables.caseId] });
			queryClient.invalidateQueries({ queryKey: ["cases", "pending"] });
			queryClient.invalidateQueries({ queryKey: ["cases", "all"] });
		},
	});
};

export const useUploadDocuments = () => {
	const queryClient = useQueryClient();
	return useMutation<
		DocumentUploadResponse,
		ApiError,
		{ caseId: string; data: DocumentUploadRequest }
	>({
		mutationFn: ({ caseId, data }) => casesApi.uploadDocuments(caseId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cases"] });
		},
	});
};

export const useUploadFile = () => {
	return useMutation<FileUploadResponse, ApiError, FileUploadRequest>({
		mutationFn: casesApi.uploadFile,
	});
};

export const useCloseCase = () => {
	const queryClient = useQueryClient();

	return useMutation<
		CloseCaseResponse,
		ApiError,
		{ caseId: string; data: CloseCaseRequest }
	>({
		mutationFn: ({ caseId, data }) => casesApi.closeCase(caseId, data),
		onSuccess: () => {
			// Invalidate all case-related queries
			queryClient.invalidateQueries({ queryKey: ["cases"] });
			queryClient.invalidateQueries({ queryKey: ["cases", "stats"] });
		},
	});
};

export const useGenerateCasePDF = () => {
	return useMutation<Blob, ApiError, string>({
		mutationFn: casesApi.generateCasePDF,
	});
};

export const useGenerateFinalCasePDF = () => {
	return useMutation<Blob, ApiError, string>({
		mutationFn: casesApi.generateFinalCasePDF,
	});
};
