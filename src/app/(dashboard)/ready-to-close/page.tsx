"use client";

import { useState } from "react";
import { useSession } from "@/queries/auth";
import { useReadyToCloseCases, Case } from "@/queries/cases";
import { format } from "date-fns";
import {
	FileText,
	Calendar,
	Search,
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	Eye,
	Download,
	CheckCircle,
	Clock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

function ReadyToClosePage() {
	const { data: session } = useSession();
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState("createdAt");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

	const {
		data: casesData,
		isLoading,
		error,
	} = useReadyToCloseCases({
		page: currentPage,
		limit: pageSize,
		sortBy,
		sortOrder: sortDirection,
	});

	// Debug logging
	console.log("Ready to close cases data:", casesData);
	console.log("Loading state:", isLoading);
	console.log("Error state:", error);

	// Check if the endpoint is not implemented
	const isEndpointNotImplemented =
		error &&
		(error.status === 404 ||
			(typeof error === "object" &&
				error !== null &&
				"status" in error &&
				error.status === 404));

	const getStatusVariant = (status: string) => {
		switch (status) {
			case "pending":
				return "secondary";
			case "approved":
				return "default";
			case "rejected":
				return "destructive";
			case "closed":
				return "outline";
			default:
				return "secondary";
		}
	};

	const getStageDisplayName = (stage: string) => {
		const stageMap: Record<string, string> = {
			tehsildar_approval: "Tehsildar Approval",
			document_upload: "Document Upload",
			sdm_review: "SDM Review",
			rahat_shakha_approval: "Rahat Shakha Approval",
			oic_approval: "OIC Approval",
			additional_collector_approval: "Additional Collector Approval",
			collector_approval: "Collector Approval",
			closed: "Case Closed",
		};
		return (
			stageMap[stage] ||
			stage.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
		);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handlePageSizeChange = (newPageSize: number) => {
		setPageSize(newPageSize);
		setCurrentPage(1);
	};

	const handleSort = (field: string) => {
		if (sortBy === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortBy(field);
			setSortDirection("asc");
		}
	};

	if (error) {
		return (
			<div className="container mx-auto py-6 space-y-6">
				{/* Header */}
				<div className="bg-gradient-to-r from-emerald-600 via-blue-700 to-slate-700 rounded-lg p-6 text-white">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold mb-2">Cases Ready to Close</h1>
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
								<FileText className="size-12 text-orange-500 mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">
									{isEndpointNotImplemented
										? "Feature Coming Soon"
										: "Error Loading Cases"}
								</h3>
								<p className="text-muted-foreground mb-4">
									{isEndpointNotImplemented
										? "The 'Ready to Close' endpoint is not yet implemented in the backend. This feature will be available soon."
										: error.message || "Failed to load cases ready to close"}
								</p>
								<div className="flex gap-4 justify-center">
									<Button asChild>
										<Link href="/overview">Go to Overview</Link>
									</Button>
									<Button asChild variant="outline">
										<Link href="/cases">View All Cases</Link>
									</Button>
								</div>
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
						<h1 className="text-3xl font-bold mb-2">Cases Ready to Close</h1>
						<h1 className="text-3xl font-bold mb-2 capitalize">
							Welcome back, {session?.user?.name}
						</h1>
						<p className="text-emerald-100 text-sm font-medium capitalize">
							Role: {session?.user?.rahatRole} • Department: Revenue Department
						</p>
					</div>
					<div className="flex items-center gap-2">
						<CheckCircle className="size-8 text-emerald-300" />
					</div>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>
						Cases Ready to Close ({casesData?.data?.totalDocs || 0})
					</CardTitle>
					<CardDescription>
						Cases that have completed all workflow stages and are ready for
						closure
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-4">
							{/* Search and Filter Skeleton */}
							<div className="flex gap-4">
								<Skeleton className="h-10 flex-1" />
								<Skeleton className="h-10 w-32" />
								<Skeleton className="h-10 w-32" />
							</div>
							{/* Table Skeleton */}
							<div className="space-y-2">
								<Skeleton className="h-12 w-full" />
								<Skeleton className="h-16 w-full" />
								<Skeleton className="h-16 w-full" />
								<Skeleton className="h-16 w-full" />
								<Skeleton className="h-16 w-full" />
							</div>
						</div>
					) : (
						<>
							{/* Search and Filter Controls */}
							<div className="flex items-center gap-4 mb-6">
								<div className="flex-1 relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
									<Input
										placeholder="Search cases..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-10"
									/>
								</div>
								<Select
									value={pageSize.toString()}
									onValueChange={(value) =>
										handlePageSizeChange(Number(value))
									}>
									<SelectTrigger className="w-32">
										<SelectValue placeholder={pageSize} />
									</SelectTrigger>
									<SelectContent>
										{[5, 10, 20, 50].map((size) => (
											<SelectItem key={size} value={size.toString()}>
												{size} per page
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Cases Table */}
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>
											<Button
												variant="ghost"
												onClick={() => handleSort("caseId")}
												className="h-auto p-0 font-semibold">
												Case ID
												<ArrowUpDown className="ml-2 size-4" />
											</Button>
										</TableHead>
										<TableHead>
											<Button
												variant="ghost"
												onClick={() => handleSort("victim.name")}
												className="h-auto p-0 font-semibold">
												Victim
												<ArrowUpDown className="ml-2 size-4" />
											</Button>
										</TableHead>
										<TableHead>
											<Button
												variant="ghost"
												onClick={() => handleSort("stage")}
												className="h-auto p-0 font-semibold">
												Stage
												<ArrowUpDown className="ml-2 size-4" />
											</Button>
										</TableHead>
										<TableHead>
											<Button
												variant="ghost"
												onClick={() => handleSort("status")}
												className="h-auto p-0 font-semibold">
												Status
												<ArrowUpDown className="ml-2 size-4" />
											</Button>
										</TableHead>
										<TableHead>
											<Button
												variant="ghost"
												onClick={() => handleSort("createdAt")}
												className="h-auto p-0 font-semibold">
												Created
												<ArrowUpDown className="ml-2 size-4" />
											</Button>
										</TableHead>
										<TableHead>
											<Button
												variant="ghost"
												onClick={() => handleSort("updatedAt")}
												className="h-auto p-0 font-semibold">
												Updated
												<ArrowUpDown className="ml-2 size-4" />
											</Button>
										</TableHead>
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
													<Badge variant="outline" className="capitalize">
														{getStageDisplayName(caseItem.stage)}
													</Badge>
												</TableCell>
												<TableCell>
													<Badge variant={getStatusVariant(caseItem.status)}>
														{caseItem.status.toUpperCase()}
													</Badge>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Calendar className="size-3 text-muted-foreground" />
														<span className="text-sm">
															{format(
																new Date(caseItem.createdAt),
																"MMM dd, yyyy"
															)}
														</span>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Clock className="size-3 text-muted-foreground" />
														<span className="text-sm">
															{format(
																new Date(caseItem.updatedAt),
																"MMM dd, yyyy"
															)}
														</span>
													</div>
												</TableCell>
												<TableCell className="text-right">
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="sm">
																<FileText className="size-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem asChild>
																<Link href={`/cases/${caseItem.caseId}`}>
																	<Eye className="size-4 mr-2" />
																	View Details
																</Link>
															</DropdownMenuItem>
															<DropdownMenuItem asChild>
																<Link href={`/cases/${caseItem.caseId}/close`}>
																	<CheckCircle className="size-4 mr-2" />
																	Close Case
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
													No Cases Ready to Close
												</h3>
												<p className="text-muted-foreground">
													No cases are currently ready for closure.
												</p>
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>

							{/* Pagination Controls */}
							{casesData && casesData.data?.totalDocs > 0 && (
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
											{Math.ceil(casesData.data.totalDocs / pageSize)}
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
													Math.ceil(casesData.data.totalDocs / pageSize)
												}>
												<span className="sr-only">Go to next page</span>
												<ChevronRight className="h-4 w-4" />
											</Button>
											<Button
												variant="outline"
												className="hidden h-8 w-8 p-0 lg:flex"
												onClick={() =>
													handlePageChange(
														Math.ceil(casesData.data.totalDocs / pageSize)
													)
												}
												disabled={
													currentPage ===
													Math.ceil(casesData.data.totalDocs / pageSize)
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

export default ReadyToClosePage;
