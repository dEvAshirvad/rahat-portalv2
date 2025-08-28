"use client";

import { useState, useEffect, useCallback } from "react";
import { Case, useAllCases } from "@/queries/cases";
import { useSession } from "@/queries/auth";
import { CollectorOnly } from "@/components/role-guard";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Search,
	Eye,
	Download,
	MoreHorizontal,
	Loader2,
	ChevronLeft,
	ChevronRight,
	FileText,
	Calendar,
	User,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import Link from "next/link";

// Case status options
const CASE_STATUSES = [
	"all",
	"pending",
	"approved",
	"rejected",
	"closed",
	"sdm_review",
	"tehsildar_review",
	"thana_incharge_review",
	"collector_approval",
];

// Sort options
const SORT_OPTIONS = [
	{ value: "createdAt", label: "Created Date" },
	{ value: "updatedAt", label: "Updated Date" },
	{ value: "caseNumber", label: "Case Number" },
	{ value: "status", label: "Status" },
	{ value: "applicantName", label: "Applicant Name" },
];

export default function CasesPage() {
	return (
		<CollectorOnly>
			<CasesPageContent />
		</CollectorOnly>
	);
}

function CasesPageContent() {
	const { data: session } = useSession();
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [sortBy, setSortBy] = useState("createdAt");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery);
		}, 500); // 500ms delay

		return () => clearTimeout(timer);
	}, [searchQuery]);

	// API parameters
	const params = {
		page: currentPage,
		limit: pageSize,
		status: statusFilter !== "all" ? statusFilter : undefined,
		sortBy,
		sortDirection,
		search: debouncedSearchQuery || undefined,
	};

	const { data: casesData, isLoading, error } = useAllCases(params);

	// Handlers
	const handleSearch = useCallback((value: string) => {
		setSearchQuery(value);
		setCurrentPage(1); // Reset to first page when searching
	}, []);

	const handleStatusFilter = (status: string) => {
		setStatusFilter(status);
		setCurrentPage(1); // Reset to first page when filtering
	};

	const handleSort = (field: string) => {
		if (sortBy === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortBy(field);
			setSortDirection("asc");
		}
		setCurrentPage(1); // Reset to first page when sorting
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handlePageSizeChange = (newPageSize: number) => {
		setPageSize(newPageSize);
		setCurrentPage(1); // Reset to first page when changing page size
	};

	const formatStatus = (status: string) => {
		return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
	};

	const getStatusVariant = (status: string) => {
		const variants: {
			[key: string]: "default" | "secondary" | "destructive" | "outline";
		} = {
			pending: "secondary",
			approved: "default",
			rejected: "destructive",
			closed: "outline",
			sdm_review: "default",
			tehsildar_review: "secondary",
			thana_incharge_review: "secondary",
			collector_approval: "default",
		};
		return variants[status] || "outline";
	};

	if (error) {
		return (
			<div className="container mx-auto py-6 space-y-6">
				{/* Header */}
				<div className="bg-gradient-to-r from-emerald-600 via-blue-700 to-slate-700 rounded-lg p-6 text-white">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold mb-2 capitalize">All Cases</h1>
							<h1 className="text-3xl font-bold mb-2 capitalize">
								Welcome back, {session?.user?.name}
							</h1>
							<p className="text-emerald-100 text-sm font-medium capitalize">
								Role: {session?.user?.rahatRole} • Department: Revenue
								Department
							</p>
						</div>
					</div>
				</div>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-center py-12">
							<div className="text-center">
								<FileText className="size-12 text-red-500 mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">
									Permission Denied
								</h3>
								<p className="text-muted-foreground mb-4">
									Only collectors can view all cases. Your current role (
									{session?.user?.rahatRole}) does not have permission to access
									this page.
								</p>
								<Button asChild>
									<Link href="/overview">Go to Overview</Link>
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-6 space-y-6">
			{/* Header */}
			<div className="bg-gradient-to-r from-emerald-600 via-blue-700 to-slate-700 rounded-lg p-6 text-white">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold mb-2 capitalize">All Cases</h1>
						<h1 className="text-3xl font-bold mb-2 capitalize">
							Welcome back, {session?.user?.name}
						</h1>
						<p className="text-emerald-100 text-sm font-medium capitalize">
							Role: {session?.user?.rahatRole} • Department: Revenue Department
						</p>
					</div>
				</div>
			</div>

			{/* Search and Filters */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
							<Input
								placeholder="Search cases by case number, applicant name, or description..."
								className="pl-10"
								value={searchQuery}
								onChange={(e) => handleSearch(e.target.value)}
							/>
						</div>
						<Select value={statusFilter} onValueChange={handleStatusFilter}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								{CASE_STATUSES.map((status) => (
									<SelectItem key={status} value={status}>
										{status === "all" ? "All Statuses" : formatStatus(status)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={sortBy} onValueChange={handleSort}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								{SORT_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button
							variant="outline"
							size="icon"
							onClick={() =>
								setSortDirection(sortDirection === "asc" ? "desc" : "asc")
							}>
							{sortDirection === "asc" ? "↑" : "↓"}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Cases Table */}
			<Card>
				<CardHeader>
					<CardTitle>Cases ({casesData?.data?.total || 0})</CardTitle>
					<CardDescription>
						All cases in the system with search and filtering capabilities.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="size-6 animate-spin" />
							<span className="ml-2">Loading cases...</span>
						</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Case Number</TableHead>
										<TableHead>Applicant</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Created</TableHead>
										<TableHead>Updated</TableHead>
										<TableHead>Assigned To</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{Array.isArray(casesData?.data?.docs) &&
									casesData.data.docs.length > 0 ? (
										casesData.data.docs.map((caseItem: Case) => (
											<TableRow key={caseItem._id}>
												<TableCell className="font-medium">
													<Link
														href={`/cases/${caseItem.caseId}`}
														className="text-blue-600 hover:text-blue-800 hover:underline">
														{caseItem.caseId}
													</Link>
												</TableCell>
												<TableCell>
													<div>
														<p className="font-medium">
															{caseItem.victim?.name || "N/A"}
														</p>
														<p className="text-sm text-muted-foreground">
															{caseItem.victim?.relative?.contact || "N/A"}
														</p>
													</div>
												</TableCell>
												<TableCell>
													<Badge variant={getStatusVariant(caseItem.status)}>
														{formatStatus(caseItem.status)}
													</Badge>
												</TableCell>
												<TableCell>
													{caseItem.createdAt ? (
														<div className="flex items-center gap-2">
															<Calendar className="size-3 text-muted-foreground" />
															{format(
																new Date(caseItem.createdAt),
																"MMM dd, yyyy"
															)}
														</div>
													) : (
														"-"
													)}
												</TableCell>
												<TableCell>
													{caseItem.updatedAt ? (
														<div className="flex items-center gap-2">
															<Calendar className="size-3 text-muted-foreground" />
															{format(
																new Date(caseItem.updatedAt),
																"MMM dd, yyyy"
															)}
														</div>
													) : (
														"-"
													)}
												</TableCell>
												<TableCell>
													{caseItem.currentRoles.length > 0 ? (
														<div className="flex items-center gap-2">
															<User className="size-3 text-muted-foreground" />
															<span className="text-sm capitalize">
																{caseItem.currentRoles.join(", ")}
															</span>
														</div>
													) : (
														<span className="text-muted-foreground">-</span>
													)}
												</TableCell>
												<TableCell className="text-right">
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="icon">
																<MoreHorizontal className="size-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem asChild>
																<Link href={`/cases/${caseItem.caseId}`}>
																	<Eye className="size-4 mr-2" />
																	View Details
																</Link>
															</DropdownMenuItem>
															<DropdownMenuItem>
																<Download className="size-4 mr-2" />
																Download PDF
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={7} className="text-center py-8">
												<FileText className="size-12 text-muted-foreground mx-auto mb-4" />
												<h3 className="text-lg font-semibold mb-2">
													No Cases Found
												</h3>
												<p className="text-muted-foreground">
													No cases match your current search criteria.
												</p>
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>

							{/* Pagination Controls */}
							{casesData && casesData.data?.total > 0 && (
								<div className="flex items-center justify-between space-x-2 py-4">
									<div className="flex items-center space-x-2">
										<p className="text-sm font-medium">Rows per page</p>
										<Select
											value={pageSize.toString()}
											onValueChange={(value) =>
												handlePageSizeChange(Number(value))
											}>
											<SelectTrigger className="h-8 w-[70px]">
												<SelectValue placeholder={pageSize} />
											</SelectTrigger>
											<SelectContent side="top">
												{[5, 10, 20, 50].map((size) => (
													<SelectItem key={size} value={size.toString()}>
														{size}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="flex items-center space-x-6 lg:space-x-8">
										<div className="flex w-[100px] items-center justify-center text-sm font-medium">
											Page {currentPage} of{" "}
											{Math.ceil(casesData.data?.total / pageSize)}
										</div>
										<div className="flex items-center space-x-2">
											<Button
												variant="outline"
												className="hidden h-8 w-8 p-0 lg:flex"
												onClick={() => handlePageChange(1)}
												disabled={currentPage === 1}>
												<span className="sr-only">Go to first page</span>
												<ChevronLeft className="h-4 w-4" />
												<ChevronLeft className="h-4 w-4" />
											</Button>
											<Button
												variant="outline"
												className="h-8 w-8 p-0"
												onClick={() => handlePageChange(currentPage - 1)}
												disabled={currentPage === 1}>
												<span className="sr-only">Go to previous page</span>
												<ChevronLeft className="h-4 w-4" />
											</Button>
											<Button
												variant="outline"
												className="h-8 w-8 p-0"
												onClick={() => handlePageChange(currentPage + 1)}
												disabled={
													currentPage ===
													Math.ceil(casesData.data?.total / pageSize)
												}>
												<span className="sr-only">Go to next page</span>
												<ChevronRight className="h-4 w-4" />
											</Button>
											<Button
												variant="outline"
												className="hidden h-8 w-8 p-0 lg:flex"
												onClick={() =>
													handlePageChange(
														Math.ceil(casesData.data?.total / pageSize)
													)
												}
												disabled={
													currentPage ===
													Math.ceil(casesData.data?.total / pageSize)
												}>
												<span className="sr-only">Go to last page</span>
												<ChevronRight className="h-4 w-4" />
												<ChevronRight className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
