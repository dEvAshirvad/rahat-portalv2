"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	useUploadDocuments,
	useUploadFile,
	useDocumentTypes,
	useCaseById,
} from "@/queries/cases";
import { toast } from "sonner";
import { Loader2, Upload, FileText, Download, Eye } from "lucide-react";
import FileUploader from "../comp-549";
import { AxiosError } from "axios";

// Form validation schema
const documentUploadSchema = z.object({
	entityType: z.string().min(1, "Document type is required"),
	description: z.string().min(1, "Description is required"),
	tags: z.string().optional(),
});

type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;

interface DocumentUploadDialogProps {
	caseId: string;
	caseNumber: string;
	onSuccess?: () => void;
}

export default function DocumentUploadDialog({
	caseId,
	caseNumber,
	onSuccess,
}: DocumentUploadDialogProps) {
	const [open, setOpen] = useState(false);
	const [uploadedFiles, setUploadedFiles] = useState<
		Array<{
			id: string;
			file:
				| File
				| { name: string; size: number; type: string; url: string; id: string };
		}>
	>([]);
	const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
	const [isUploading, setIsUploading] = useState(false);

	const uploadFileMutation = useUploadFile();
	const uploadDocumentsMutation = useUploadDocuments();

	// Fetch document types and case data
	const { data: documentTypesData, isLoading: documentTypesLoading } =
		useDocumentTypes();
	const {
		data: caseData,
		isLoading: caseLoading,
		refetch: refetchCase,
	} = useCaseById(caseNumber);

	const form = useForm<DocumentUploadFormData>({
		resolver: zodResolver(documentUploadSchema),
		defaultValues: {
			entityType: "",
			description: "",
			tags: "",
		},
	});

	const onSubmit = async (data: DocumentUploadFormData) => {
		if (uploadedFiles.length === 0) {
			toast.error("Please select at least one file to upload");
			return;
		}

		setIsUploading(true);

		try {
			// Step 1: Upload each file to static storage
			const fileIds: string[] = [];

			for (const file of uploadedFiles) {
				// Only process if the file is actually a File object
				if (file.file instanceof File) {
					const uploadResponse = await uploadFileMutation.mutateAsync({
						file: file.file,
						entityType: data.entityType,
						description: data.description,
						tags: data.tags || data.entityType || "",
						uploadedFor: caseNumber,
						isPublic: true,
					});

					fileIds.push(uploadResponse.data.id);
				}
			}

			// Step 2: Link uploaded files to the case
			const documents = fileIds.map((fileId) => ({
				fileId,
				documentType: data.entityType as
					| "patwari-inspection"
					| "postmortem-report"
					| "inspection-report",
			}));

			await uploadDocumentsMutation.mutateAsync({
				caseId,
				data: {
					documents,
				},
			});

			toast.success("Documents uploaded and linked successfully!");
			form.reset();
			setUploadedFiles([]);
			setUploadedFileIds([]);
			setOpen(false);
			onSuccess?.();
		} catch (error) {
			if (error instanceof AxiosError) {
				toast.error(
					error.response?.data.message || "Failed to upload documents"
				);
			}
		} finally {
			setIsUploading(false);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen && (isUploading || uploadDocumentsMutation.isPending)) return;
		setOpen(newOpen);
		if (newOpen) {
			// Refetch case data when dialog opens
			refetchCase();
		}
		if (!newOpen) {
			form.reset();
			setUploadedFiles([]);
			setUploadedFileIds([]);
		}
	};

	const handleFilesChange = (
		files: Array<{
			id: string;
			file:
				| File
				| { name: string; size: number; type: string; url: string; id: string };
		}>
	) => {
		setUploadedFiles(files);
	};

	const documentTypes = documentTypesData?.data || [];
	const caseInfo = caseData?.data;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<Upload className="size-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Upload Documents</DialogTitle>
					<DialogDescription>
						Upload documents for case {caseNumber}. Select document type and add
						description.
					</DialogDescription>
				</DialogHeader>

				<Tabs defaultValue="upload" className="space-y-4">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="upload">Upload New</TabsTrigger>
						<TabsTrigger value="history">Document History</TabsTrigger>
					</TabsList>

					<TabsContent value="upload" className="space-y-6">
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6">
								{/* Document Type Selection */}
								<FormField
									control={form.control}
									name="entityType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Document Type *</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
												disabled={documentTypesLoading}>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue
															placeholder={
																documentTypesLoading
																	? "Loading document types..."
																	: "Select document type"
															}
														/>
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{documentTypesLoading ? (
														<SelectItem value="" disabled>
															Loading...
														</SelectItem>
													) : documentTypes.length > 0 ? (
														documentTypes.map((docType) => (
															<SelectItem
																key={docType.type}
																value={docType.type}>
																{docType.name ||
																	docType.type.replace(/_/g, " ").toUpperCase()}
															</SelectItem>
														))
													) : (
														<SelectItem value="" disabled>
															No document types available
														</SelectItem>
													)}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Description */}
								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description *</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Enter document description..."
													className="min-h-[80px]"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* File Upload */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Upload Files</h3>
									<FileUploader
										onFilesChange={handleFilesChange}
										maxFiles={5}
										maxSize={50 * 1024 * 1024} // 50MB
									/>
								</div>

								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => setOpen(false)}
										disabled={isUploading || uploadDocumentsMutation.isPending}>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={
											isUploading ||
											uploadDocumentsMutation.isPending ||
											!form.formState.isValid ||
											uploadedFiles.length === 0
										}>
										{isUploading || uploadDocumentsMutation.isPending ? (
											<>
												<Loader2 className="size-4 mr-2 animate-spin" />
												{isUploading
													? "Uploading Files..."
													: "Linking to Case..."}
											</>
										) : (
											<>
												<FileText className="size-4 mr-2" />
												Upload Documents
											</>
										)}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</TabsContent>

					<TabsContent value="history" className="space-y-4">
						{caseLoading ? (
							<div className="flex items-center justify-center py-8">
								<Loader2 className="size-6 animate-spin" />
								<span className="ml-2">Loading document history...</span>
							</div>
						) : caseInfo?.documents && caseInfo.documents.length > 0 ? (
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-semibold">
										Document History ({caseInfo.documents.length})
									</h3>
									<Button
										variant="outline"
										size="sm"
										onClick={() => refetchCase()}
										disabled={caseLoading}>
										<Loader2
											className={`size-4 mr-2 ${
												caseLoading ? "animate-spin" : ""
											}`}
										/>
										Refresh
									</Button>
								</div>
								{caseInfo.documents.map((doc, index) => (
									<div
										key={doc.fileId._id}
										className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
										<div className="flex items-center gap-3 flex-1 min-w-0">
											<FileText className="size-5 text-muted-foreground flex-shrink-0" />
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-1">
													<p className="text-xs font-medium">
														{doc.type.replace(/-/g, " ").toUpperCase()}
													</p>
												</div>
												<div className="flex items-center gap-4 text-sm text-muted-foreground">
													<span>Document #{index + 1}</span>
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2 flex-shrink-0">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => {
													const downloadUrl = `http://localhost:3001/api/v1/files/static/${doc.fileId._id}/download`;
													window.open(downloadUrl, "_blank");
												}}
												title="Download Document">
												<Download className="size-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													const viewUrl = `http://localhost:3001/api/v1/files/static/${doc.fileId._id}/serve`;
													window.open(viewUrl, "_blank");
												}}
												title="View Document">
												<Eye className="size-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-8">
								<FileText className="size-12 text-muted-foreground mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">
									No Documents Uploaded
								</h3>
								<p className="text-muted-foreground mb-4">
									No documents have been uploaded for this case yet.
								</p>
								<Button
									variant="outline"
									onClick={() => refetchCase()}
									disabled={caseLoading}>
									<Loader2
										className={`size-4 mr-2 ${
											caseLoading ? "animate-spin" : ""
										}`}
									/>
									Refresh Data
								</Button>
								{/* Debug info */}
								{process.env.NODE_ENV === "development" && (
									<div className="mt-4 p-2 bg-gray-100 rounded text-xs">
										<strong>Debug Info:</strong>
										<br />
										Case ID: {caseId}
										<br />
										Case Data: {caseData ? "Loaded" : "Not loaded"}
										<br />
										Documents: {caseInfo?.documents?.length || 0}
										<br />
										Case Info: {caseInfo ? "Available" : "Not available"}
									</div>
								)}
							</div>
						)}
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
