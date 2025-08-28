"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/queries/auth";
import { useCaseById, useWorkflowStatus, Case } from "@/queries/cases";
import { format } from "date-fns";
import {
	ArrowLeft,
	FileText,
	User,
	Calendar,
	MapPin,
	Phone,
	Mail,
	Download,
	Edit,
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle,
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import DocumentUploadDialog from "@/components/Dialogs/DocumentUploadDialog";
import WorkflowUpdateDialog from "@/components/Dialogs/WorkflowUpdateDialog";
import { DownloadButton } from "@/components/DataTable/RahatCases/RahatCasesTable";

function CaseDetailPage() {
	const { id } = useParams();
	const router = useRouter();
	const { data: session } = useSession();

	const { data: caseData, isLoading, error } = useCaseById(id as string);

	const caseItem = caseData?.data;

	if (isLoading) {
		return (
			<div className="container mx-auto py-6 space-y-6">
				{/* Header Skeleton */}
				<div className="bg-gradient-to-r from-emerald-600 via-blue-700 to-slate-700 rounded-lg p-6 text-white">
					<div className="flex items-center justify-between">
						<div>
							<Skeleton className="h-8 w-64 bg-white/20 mb-2" />
							<Skeleton className="h-6 w-48 bg-white/20 mb-2" />
							<Skeleton className="h-4 w-56 bg-white/20" />
						</div>
					</div>
				</div>

				{/* Content Skeleton */}
				<div className="grid gap-6 md:grid-cols-3">
					<div className="md:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<Skeleton className="h-6 w-32" />
								<Skeleton className="h-4 w-48" />
							</CardHeader>
							<CardContent className="space-y-4">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
							</CardContent>
						</Card>
					</div>
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<Skeleton className="h-6 w-24" />
							</CardHeader>
							<CardContent className="space-y-4">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto py-6 space-y-6">
				{/* Header */}
				<div className="bg-gradient-to-r from-emerald-600 via-blue-700 to-slate-700 rounded-lg p-6 text-white">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold mb-2">Case Details</h1>
							<h2 className="text-xl font-semibold mb-2">Case ID: {id}</h2>
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
									Error Loading Case
								</h3>
								<p className="text-muted-foreground mb-4">
									{error.message || "Failed to load case details"}
								</p>
								<Button asChild>
									<Link href="/cases">
										<ArrowLeft className="size-4 mr-2" />
										Back to Cases
									</Link>
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!caseItem) {
		return (
			<div className="container mx-auto py-6 space-y-6">
				{/* Header */}
				<div className="bg-gradient-to-r from-emerald-600 via-blue-700 to-slate-700 rounded-lg p-6 text-white">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold mb-2">Case Details</h1>
							<h2 className="text-xl font-semibold mb-2">Case ID: {id}</h2>
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
								<FileText className="size-12 text-muted-foreground mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">Case Not Found</h3>
								<p className="text-muted-foreground mb-4">
									The case you're looking for doesn't exist or you don't have
									permission to view it.
								</p>
								<Button asChild>
									<Link href="/cases">
										<ArrowLeft className="size-4 mr-2" />
										Back to Cases
									</Link>
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

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

	return (
		<div className="container mx-auto py-10 space-y-6">
			{/* Header */}
			<Button size="sm" onClick={() => router.push("/")}>
				<ArrowLeft className="size-4 mr-2" />
				Back
			</Button>
			<div className="bg-gradient-to-r from-emerald-600 via-blue-700 to-slate-700 rounded-lg p-6 text-white">
				<div className="flex items-start justify-between">
					<div>
						<div className="flex items-center gap-4 mb-2">
							<h1 className="text-3xl font-bold">Case Details</h1>
						</div>
						<h2 className="text-xl font-semibold mb-2">
							Case ID: {caseItem.caseId}
						</h2>
						<p className="text-emerald-100 text-sm font-medium capitalize">
							Role: {session?.user?.rahatRole} • Department: Revenue Department
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant={getStatusVariant(caseItem.status)}>
							{caseItem.status.toUpperCase()}
						</Badge>
						<Badge variant="secondary">
							{getStageDisplayName(caseItem.stage)}
						</Badge>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="grid gap-6 md:grid-cols-3">
				{/* Left Column - Main Case Info */}
				<div className="md:col-span-2 space-y-6">
					{/* Victim Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="size-5" />
								Victim Information
							</CardTitle>
							<CardDescription>
								Details about the victim and their family
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Name
									</label>
									<p className="text-lg font-semibold">
										{caseItem.victim.name}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Date of Birth
									</label>
									<p className="text-lg">
										{format(new Date(caseItem.victim.dob), "PPP")}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Date of Death
									</label>
									<p className="text-lg">
										{format(new Date(caseItem.victim.dod), "PPP")}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Address
									</label>
									<p className="text-lg">{caseItem.victim.address}</p>
								</div>
								<div className="md:col-span-2">
									<label className="text-sm font-medium text-muted-foreground">
										Description
									</label>
									<p className="text-lg">{caseItem.victim.description}</p>
								</div>
							</div>

							<Separator />

							<div>
								<h4 className="font-semibold mb-3 flex items-center gap-2">
									<Phone className="size-4" />
									Relative Information
								</h4>
								<div className="grid gap-4 md:grid-cols-3">
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Name
										</label>
										<p className="text-lg font-semibold">
											{caseItem.victim.relative.name}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Contact
										</label>
										<p className="text-lg">
											{caseItem.victim.relative.contact}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Relation
										</label>
										<p className="text-lg capitalize">
											{caseItem.victim.relative.relation}
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Documents */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="size-5" />
								Documents ({caseItem.documents.length})
							</CardTitle>
							<CardDescription>
								Documents uploaded for this case
							</CardDescription>
						</CardHeader>
						<CardContent>
							{caseItem.documents.length > 0 ? (
								<div className="space-y-3">
									{caseItem.documents.map((doc, index) => (
										<div
											key={doc.fileId._id}
											className="flex items-center justify-between p-3 border rounded-lg">
											<div className="flex items-center gap-3">
												<FileText className="size-5 text-blue-600" />
												<div>
													<p className="font-medium capitalize">
														{doc.type.replace(/-/g, " ")}
													</p>
													<p className="text-sm text-muted-foreground truncate max-w-[200px]">
														{doc.fileId?.originalName || "Document"}
													</p>
												</div>
											</div>
											<Button variant="outline" size="sm">
												<Download className="size-4 mr-2" />
												Download
											</Button>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8">
									<FileText className="size-12 text-muted-foreground mx-auto mb-4" />
									<h3 className="text-lg font-semibold mb-2">No Documents</h3>
									<p className="text-muted-foreground">
										No documents have been uploaded for this case yet.
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Remarks History */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Clock className="size-5" />
								Case History ({caseItem.remarks.length})
							</CardTitle>
							<CardDescription>
								Timeline of actions and remarks for this case
							</CardDescription>
						</CardHeader>
						<CardContent>
							{caseItem.remarks.length > 0 ? (
								<div className="space-y-4">
									{caseItem.remarks.map((remark, index) => (
										<div key={remark._id} className="flex gap-4">
											<div className="flex flex-col items-center">
												<div className="w-3 h-3 bg-blue-600 rounded-full"></div>
												{index < caseItem.remarks.length - 1 && (
													<div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
												)}
											</div>
											<div className="flex-1 pb-4">
												<div className="flex items-center justify-between mb-2">
													<p className="font-medium">Stage {remark.stage}</p>
													<p className="text-sm text-muted-foreground">
														{format(
															new Date(remark.date),
															"MMM dd, yyyy 'at' h:mm a"
														)}
													</p>
												</div>
												<p className="text-muted-foreground">{remark.remark}</p>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8">
									<Clock className="size-12 text-muted-foreground mx-auto mb-4" />
									<h3 className="text-lg font-semibold mb-2">No History</h3>
									<p className="text-muted-foreground">
										No remarks or actions have been recorded for this case yet.
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Sidebar */}
				<div className="space-y-6">
					{/* Case Status */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<CheckCircle className="size-5" />
								Case Status
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="text-sm font-medium text-muted-foreground">
									Current Stage
								</label>
								<p className="text-lg font-semibold">
									{getStageDisplayName(caseItem.stage)}
								</p>
							</div>
							<div className="space-x-2">
								<label className="text-sm font-medium text-muted-foreground">
									Status
								</label>
								<Badge
									variant={getStatusVariant(caseItem.status)}
									className="mt-1">
									{caseItem.status.toUpperCase()}
								</Badge>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium text-muted-foreground">
									Current Roles
								</label>
								<div className="flex flex-wrap gap-1 mt-1">
									{caseItem.currentRoles.map((role) => (
										<Badge key={role} variant="outline" className="capitalize">
											{role.replace(/-/g, " ")}
										</Badge>
									))}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Case Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="size-5" />
								Case Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="text-sm font-medium text-muted-foreground">
									Created
								</label>
								<p className="text-sm">
									{format(new Date(caseItem.createdAt), "PPP")}
								</p>
								<p className="text-xs text-muted-foreground">
									{format(new Date(caseItem.createdAt), "h:mm a")}
								</p>
							</div>
							<div>
								<label className="text-sm font-medium text-muted-foreground">
									Last Updated
								</label>
								<p className="text-sm">
									{format(new Date(caseItem.updatedAt), "PPP")}
								</p>
								<p className="text-xs text-muted-foreground">
									{format(new Date(caseItem.updatedAt), "h:mm a")}
								</p>
							</div>
							<div>
								<label className="text-sm font-medium text-muted-foreground">
									Case ID
								</label>
								<p className="text-sm font-mono">{caseItem.caseId}</p>
							</div>
						</CardContent>
					</Card>

					{/* Actions */}
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="flex items-center gap-2">
									<Edit className="size-5" />
									Actions
								</CardTitle>
								<div className="flex items-center gap-2">
									<DownloadButton caseId={caseItem.caseId} />
									{caseItem.stage === "doc_upload" && (
										<DocumentUploadDialog
											caseId={caseItem.caseId}
											caseNumber={caseItem.caseId}
											onSuccess={() => {
												// Trigger table refresh if needed
												window.location.reload();
											}}
										/>
									)}
									<WorkflowUpdateDialog
										caseId={caseItem._id}
										onSuccess={() => {
											// Trigger table refresh if needed
											window.location.reload();
										}}
									/>
									{caseItem.status !== "closed" && (
										<Button asChild variant="destructive" size="sm">
											<Link href={`/cases/${caseItem.caseId}/close`}>
												<CheckCircle className="size-4 mr-2" />
												Close Case
											</Link>
										</Button>
									)}
								</div>
							</div>
						</CardHeader>
					</Card>
				</div>
			</div>
		</div>
	);
}

export default CaseDetailPage;
