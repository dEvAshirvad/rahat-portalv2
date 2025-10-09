"use client";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	Table as ReactTable,
	useReactTable,
} from "@tanstack/react-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Case } from "@/queries/cases";
import { Button } from "@/components/ui/button";
import {
	Eye,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	Download,
	CheckCircle,
} from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import WorkflowUpdateDialog from "@/components/Dialogs/WorkflowUpdateDialog";
import DocumentUploadDialog from "@/components/Dialogs/DocumentUploadDialog";
import { useGenerateCasePDF } from "@/queries/cases";
import { toast } from "sonner";
import { AxiosError } from "axios";

const columns: ColumnDef<Case>[] = [
	{
		accessorKey: "caseId",
		header: () => {
			return <p className="text-sm font-medium pl-4">Case ID</p>;
		},
		cell: ({ row }) => {
			return <div className="font-medium pl-4">{row.original.caseId}</div>;
		},
	},
	{
		accessorKey: "victim.name",
		header: () => {
			return <p className="text-sm font-medium">Victim Name</p>;
		},
		cell: ({ row }) => {
			return <div className="font-medium">{row.original.victim.name}</div>;
		},
	},
	{
		accessorKey: "caseType",
		header: () => {
			return <p className="text-sm font-medium pl-4">Case Type</p>;
		},
		cell: ({ row }) => {
			return <div className="font-medium pl-4">{row.original.caseType}</div>;
		},
	},
	{
		accessorKey: "stage",
		header: () => {
			return <p className="text-sm font-medium">Stage</p>;
		},
		cell: ({ row }) => {
			const stage = row.original.stage;
			const getStageColor = (stage: string) => {
				switch (stage) {
					case "closed":
						return "bg-green-100 text-green-800";
					case "pending":
						return "bg-yellow-100 text-yellow-800";
					case "rejected":
						return "bg-red-100 text-red-800";
					default:
						return "bg-blue-100 text-blue-800";
				}
			};

			return (
				<Badge className={cn("text-xs capitalize", getStageColor(stage))}>
					{stage.replace(/_/g, " ")}
				</Badge>
			);
		},
	},
	{
		accessorKey: "status",
		header: () => {
			return <p className="text-sm font-medium">Status</p>;
		},
		cell: ({ row }) => {
			const status = row.original.status;
			const getStatusColor = (status: string) => {
				switch (status) {
					case "closed":
						return "bg-green-100 text-green-800";
					case "pending":
						return "bg-yellow-100 text-yellow-800";
					case "rejected":
						return "bg-red-100 text-red-800";
					default:
						return "bg-gray-100 text-gray-800";
				}
			};

			return (
				<Badge className={cn("text-xs capitalize", getStatusColor(status))}>
					{status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "documents",
		header: () => {
			return <p className="text-sm font-medium text-center">Documents</p>;
		},
		cell: ({ row }) => {
			return (
				<p className="text-sm text-center text-muted-foreground">
					{row.original.documents.length}
				</p>
			);
		},
	},
	{
		accessorKey: "paymentId.status",
		header: () => {
			return <p className="text-sm font-medium text-center">Payment</p>;
		},
		cell: ({ row }) => {
			const payment = row.original.paymentId;
			if (!payment) {
				return (
					<Badge variant="outline" className="text-xs">
						Pending
					</Badge>
				);
			}

			const getPaymentColor = (status: string) => {
				switch (status) {
					case "completed":
						return "bg-green-100 text-green-800";
					case "pending":
						return "bg-yellow-100 text-yellow-800";
					case "failed":
						return "bg-red-100 text-red-800";
					default:
						return "bg-gray-100 text-gray-800";
				}
			};

			return (
				<Badge
					className={cn("text-xs capitalize", getPaymentColor(payment.status))}>
					{payment.status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: () => {
			return <p className="text-sm font-medium text-center">Created At</p>;
		},
		cell: ({ row }) => {
			return (
				<div className="text-sm text-muted-foreground text-center">
					{format(new Date(row.original.createdAt), "MMM d, yyyy")}
				</div>
			);
		},
	},
	{
		id: "actions",
		header: () => {
			return <p className="text-sm font-medium text-center">Actions</p>;
		},
		cell: ({ row }) => {
			const caseId = row.original._id;
			const caseNumber = row.original.caseId;

			return (
				<div className="flex items-center justify-center gap-2">
					<Button
						variant="outline"
						size="icon"
						onClick={(e) => {
							e.stopPropagation();
							// Navigate to case details
							window.open(`/cases/${caseNumber}`, "_blank");
						}}
						title="View Case Details">
						<Eye className="size-4" />
					</Button>
					{row.original.stage === "closed" &&
						row.original.status === "pending" && (
							<Button
								variant="outline"
								size="icon"
								onClick={(e) => {
									e.stopPropagation();
									// Navigate to case details
									window.open(`/cases/${caseNumber}/close`, "_blank");
								}}
								title="Close Case">
								<CheckCircle className="size-4" />
							</Button>
						)}
					{row.original.stage === "doc_upload" && (
						<DocumentUploadDialog
							caseId={caseId}
							caseNumber={caseNumber}
							onSuccess={() => {
								// Trigger table refresh if needed
								window.location.reload();
							}}
						/>
					)}
					<WorkflowUpdateDialog
						caseId={caseId}
						onSuccess={() => {
							// Trigger table refresh if needed
							window.location.reload();
						}}
					/>
				</div>
			);
		},
	},
];

// Download Button Component
export function DownloadButton({ caseId }: { caseId: string }) {
	const generatePDFMutation = useGenerateCasePDF();

	const handleDownload = async () => {
		try {
			const response = await generatePDFMutation.mutateAsync(caseId);

			// Create a blob from the PDF data
			const blob = new Blob([response], { type: "application/pdf" });
			const url = window.URL.createObjectURL(blob);

			// Create a temporary link and trigger download
			const link = document.createElement("a");
			link.href = url;
			link.download = `case-${caseId}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// Clean up the URL
			window.URL.revokeObjectURL(url);

			toast.success("PDF downloaded successfully!");
		} catch (error) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data.message || "Failed to download PDF");
			}
		}
	};

	return (
		<Button
			variant="outline"
			size="icon"
			onClick={(e) => {
				e.stopPropagation();
				handleDownload();
			}}
			disabled={generatePDFMutation.isPending}
			title="Download PDF">
			{generatePDFMutation.isPending ? (
				<div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
			) : (
				<Download className="size-4" />
			)}
		</Button>
	);
}

interface PaginationData {
	docs: Case[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

interface RahatCasesTableProps {
	data?: PaginationData;
	onPageChange?: (page: number) => void;
	onPageSizeChange?: (pageSize: number) => void;
	isLoading?: boolean;
}

function RahatCasesTable({
	data,
	onPageChange,
	onPageSizeChange,
	isLoading = false,
}: RahatCasesTableProps) {
	const table = useReactTable({
		data: data?.docs || [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		pageCount: data?.totalPages || 0,
		state: {
			pagination: {
				pageIndex: (data?.page || 1) - 1,
				pageSize: data?.limit || 10,
			},
		},
		onPaginationChange: (updater) => {
			if (typeof updater === "function") {
				const newState = updater({
					pageIndex: (data?.page || 1) - 1,
					pageSize: data?.limit || 10,
				});

				if (onPageChange && newState.pageIndex !== (data?.page || 1) - 1) {
					onPageChange(newState.pageIndex + 1);
				}

				if (onPageSizeChange && newState.pageSize !== (data?.limit || 10)) {
					onPageSizeChange(newState.pageSize);
				}
			}
		},
	});

	return (
		<div className="space-y-6 bg-background p-4 rounded-lg">
			<TableViewRenderer table={table} />
			<PaginationControls
				table={table}
				data={data}
				isLoading={isLoading}
				onPageChange={onPageChange}
				onPageSizeChange={onPageSizeChange}
			/>
		</div>
	);
}

function PaginationControls({
	table,
	data,
	isLoading,
	onPageChange,
	onPageSizeChange,
}: {
	table: ReactTable<Case>;
	data?: PaginationData;
	isLoading: boolean;
	onPageChange?: (page: number) => void;
	onPageSizeChange?: (pageSize: number) => void;
}) {
	if (!data) return null;

	const { total, page, limit, totalPages, hasNextPage, hasPreviousPage } = data;

	return (
		<div className="flex items-center justify-between px-2">
			<div className="flex-1 text-sm text-muted-foreground">
				Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{" "}
				{total} results
			</div>
			<div className="flex items-center space-x-6 lg:space-x-8">
				<div className="flex items-center space-x-2">
					<p className="text-sm font-medium">Rows per page</p>
					<Select
						value={`${limit}`}
						onValueChange={(value) => {
							onPageSizeChange?.(Number(value));
						}}>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue placeholder={limit} />
						</SelectTrigger>
						<SelectContent side="top">
							{[10, 20, 30, 40, 50].map((pageSize) => (
								<SelectItem key={pageSize} value={`${pageSize}`}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex w-[100px] items-center justify-center text-sm font-medium">
					Page {page} of {totalPages}
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => onPageChange?.(1)}
						disabled={!hasPreviousPage || isLoading}>
						<span className="sr-only">Go to first page</span>
						<ChevronsLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="h-8 w-8 p-0"
						onClick={() => onPageChange?.(page - 1)}
						disabled={!hasPreviousPage || isLoading}>
						<span className="sr-only">Go to previous page</span>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="h-8 w-8 p-0"
						onClick={() => onPageChange?.(page + 1)}
						disabled={!hasNextPage || isLoading}>
						<span className="sr-only">Go to next page</span>
						<ChevronRight className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => onPageChange?.(totalPages)}
						disabled={!hasNextPage || isLoading}>
						<span className="sr-only">Go to last page</span>
						<ChevronsRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}

function TableViewRenderer({ table }: { table: ReactTable<Case> }) {
	return (
		<div className="">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext()
											  )}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								data-state={row.getIsSelected() && "selected"}
								className="cursor-pointer hover:bg-muted/50"
								key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-64 text-center">
								No cases found.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

export default RahatCasesTable;
