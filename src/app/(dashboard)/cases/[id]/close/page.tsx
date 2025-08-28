"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/queries/auth";
import { useCaseById, useCloseCase, CloseCaseRequest } from "@/queries/cases";
import { format } from "date-fns";
import {
	ArrowLeft,
	FileText,
	User,
	Calendar,
	DollarSign,
	Banknote,
	CreditCard,
	CheckCircle,
	AlertCircle,
	Save,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

// Form validation schema
const closeCaseSchema = z.object({
	amount: z.number().min(1, "Amount must be greater than 0"),
	paymentMethod: z.enum(["bank_transfer", "cash", "cheque", "online"]),
	remark: z.string().optional(),
	beneficiaryDetails: z.object({
		name: z.string().min(1, "Beneficiary name is required"),
		accountNumber: z.string().optional(),
		bankName: z.string().optional(),
		ifscCode: z.string().optional(),
	}),
});

type CloseCaseFormData = z.infer<typeof closeCaseSchema>;

function CloseCasePage() {
	const { id } = useParams();
	const router = useRouter();
	const { data: session } = useSession();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const caseId = id as string;

	const { data: caseData, isLoading, error } = useCaseById(caseId);
	const closeCaseMutation = useCloseCase();

	const caseItem = caseData?.data;

	// Form setup
	const form = useForm<CloseCaseFormData>({
		resolver: zodResolver(closeCaseSchema),
		defaultValues: {
			amount: 0,
			paymentMethod: "bank_transfer",
			remark: "",
			beneficiaryDetails: {
				name: "",
				accountNumber: "",
				bankName: "",
				ifscCode: "",
			},
		},
	});

	const onSubmit = async (data: CloseCaseFormData) => {
		if (!caseId) return;

		setIsSubmitting(true);
		try {
			const closeCaseData: CloseCaseRequest = {
				amount: data.amount,
				paymentMethod: data.paymentMethod,
				remark: data.remark,
				beneficiaryDetails: {
					name: data.beneficiaryDetails.name,
					accountNumber: data.beneficiaryDetails.accountNumber,
					bankName: data.beneficiaryDetails.bankName,
					ifscCode: data.beneficiaryDetails.ifscCode,
				},
			};

			await closeCaseMutation.mutateAsync({
				caseId: caseData?.data._id || "",
				data: closeCaseData,
			});

			toast.success("Case closed successfully!");
			router.push(`/cases/${caseId}`);
		} catch (error: any) {
			console.error("Error closing case:", error);
			toast.error(error?.message || "Failed to close case");
		} finally {
			setIsSubmitting(false);
		}
	};

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

	const getPaymentMethodIcon = (method: string) => {
		switch (method) {
			case "bank_transfer":
				return <Banknote className="size-4" />;
			case "cash":
				return <DollarSign className="size-4" />;
			case "cheque":
				return <FileText className="size-4" />;
			case "online":
				return <CreditCard className="size-4" />;
			default:
				return <DollarSign className="size-4" />;
		}
	};

	const getPaymentMethodLabel = (method: string) => {
		switch (method) {
			case "bank_transfer":
				return "Bank Transfer";
			case "cash":
				return "Cash";
			case "cheque":
				return "Cheque";
			case "online":
				return "Online Payment";
			default:
				return method;
		}
	};

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
							<h1 className="text-3xl font-bold mb-2">Close Case</h1>
							<h2 className="text-xl font-semibold mb-2">Case ID: {caseId}</h2>
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
							<h1 className="text-3xl font-bold mb-2">Close Case</h1>
							<h2 className="text-xl font-semibold mb-2">Case ID: {caseId}</h2>
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

	// Check if case is already closed
	if (caseItem.status === "closed") {
		return (
			<div className="container mx-auto py-6 space-y-6">
				{/* Header */}
				<Button onClick={() => router.back()}>
					<ArrowLeft className="size-4 mr-2" />
					Back
				</Button>
				<div className="bg-gradient-to-r from-emerald-600 via-blue-700 to-slate-700 rounded-lg p-6 text-white">
					<div className="flex items-center justify-between">
						<div>
							<div className="flex items-center gap-4 mb-2">
								<h1 className="text-3xl font-bold">Close Case</h1>
							</div>
							<h2 className="text-xl font-semibold mb-2">
								Case ID: {caseItem.caseId}
							</h2>
							<p className="text-emerald-100 text-sm font-medium capitalize">
								Role: {session?.user?.rahatRole} • Department: Revenue
								Department
							</p>
						</div>
						<div className="flex items-center gap-2">
							<Badge variant="outline" className="text-white border-white/30">
								{caseItem.status.toUpperCase()}
							</Badge>
						</div>
					</div>
				</div>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-center py-12">
							<div className="text-center">
								<CheckCircle className="size-12 text-green-500 mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">
									Case Already Closed
								</h3>
								<p className="text-muted-foreground mb-4">
									This case has already been closed and cannot be closed again.
								</p>
								<Button asChild>
									<Link href={`/cases/${caseId}`}>
										<ArrowLeft className="size-4 mr-2" />
										View Case Details
									</Link>
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
			<Button onClick={() => router.back()}>
				<ArrowLeft className="size-4 mr-2" />
				Back
			</Button>
			<div className="bg-gradient-to-r from-emerald-600 via-blue-700 to-slate-700 rounded-lg p-6 text-white">
				<div className="flex items-center justify-between">
					<div>
						<div className="flex items-center gap-4 mb-2">
							<h1 className="text-3xl font-bold">Close Case</h1>
						</div>
						<h2 className="text-xl font-semibold mb-2">
							Case ID: {caseItem.caseId}
						</h2>
						<p className=" text-sm font-medium capitalize">
							Role: {session?.user?.rahatRole} • Department: Revenue Department
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant={getStatusVariant(caseItem.status)}>
							{caseItem.status.toUpperCase()}
						</Badge>
						<Badge>{getStageDisplayName(caseItem.stage)}</Badge>
					</div>
				</div>
			</div>

			{/* Warning Alert */}
			<Card className="border-orange-200 bg-orange-50">
				<CardContent>
					<div className="flex items-start gap-3">
						<AlertCircle className="size-5 text-orange-600 mt-0.5" />
						<div>
							<h3 className="font-semibold text-orange-800 mb-1">
								Important Notice
							</h3>
							<p className="text-orange-700 text-sm">
								Closing a case is a permanent action. Once closed, the case
								cannot be reopened. Please ensure all required documents are
								uploaded and the case has been properly reviewed before
								proceeding with the closure.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Main Content */}
			<div className="grid gap-6 md:grid-cols-3">
				{/* Left Column - Close Case Form */}
				<div className="md:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<DollarSign className="size-5" />
								Close Case Form
							</CardTitle>
							<CardDescription>
								Provide payment details and beneficiary information to close
								this case
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6">
								{/* Payment Amount */}
								<div>
									<Label htmlFor="amount" className="text-base font-medium">
										Payment Amount (₹)
									</Label>
									<Input
										id="amount"
										type="number"
										placeholder="Enter payment amount"
										{...form.register("amount", { valueAsNumber: true })}
										className="mt-2"
									/>
									{form.formState.errors.amount && (
										<p className="text-red-500 text-sm mt-1">
											{form.formState.errors.amount.message}
										</p>
									)}
								</div>

								{/* Payment Method */}
								<div>
									<Label
										htmlFor="paymentMethod"
										className="text-base font-medium">
										Payment Method
									</Label>
									<Select
										value={form.watch("paymentMethod")}
										onValueChange={(value) =>
											form.setValue("paymentMethod", value as any)
										}>
										<SelectTrigger className="mt-2">
											<SelectValue placeholder="Select payment method" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="bank_transfer">
												<div className="flex items-center gap-2">
													<Banknote className="size-4" />
													Bank Transfer
												</div>
											</SelectItem>
											<SelectItem value="cash">
												<div className="flex items-center gap-2">
													<DollarSign className="size-4" />
													Cash
												</div>
											</SelectItem>
											<SelectItem value="cheque">
												<div className="flex items-center gap-2">
													<FileText className="size-4" />
													Cheque
												</div>
											</SelectItem>
											<SelectItem value="online">
												<div className="flex items-center gap-2">
													<CreditCard className="size-4" />
													Online Payment
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
									{form.formState.errors.paymentMethod && (
										<p className="text-red-500 text-sm mt-1">
											{form.formState.errors.paymentMethod.message}
										</p>
									)}
								</div>

								{/* Remark */}
								<div>
									<Label htmlFor="remark" className="text-base font-medium">
										Remark (Optional)
									</Label>
									<Textarea
										id="remark"
										placeholder="Add any additional remarks about the case closure"
										{...form.register("remark")}
										className="mt-2"
										rows={3}
									/>
									{form.formState.errors.remark && (
										<p className="text-red-500 text-sm mt-1">
											{form.formState.errors.remark.message}
										</p>
									)}
								</div>

								<Separator />

								{/* Beneficiary Details */}
								<div>
									<h3 className="text-lg font-semibold mb-4">
										Beneficiary Details
									</h3>

									{/* Beneficiary Name */}
									<div className="mb-4">
										<Label
											htmlFor="beneficiaryName"
											className="text-base font-medium">
											Beneficiary Name *
										</Label>
										<Input
											id="beneficiaryName"
											placeholder="Enter beneficiary name"
											{...form.register("beneficiaryDetails.name")}
											className="mt-2"
										/>
										{form.formState.errors.beneficiaryDetails?.name && (
											<p className="text-red-500 text-sm mt-1">
												{form.formState.errors.beneficiaryDetails.name.message}
											</p>
										)}
									</div>

									{/* Bank Details (conditional based on payment method) */}
									{form.watch("paymentMethod") === "bank_transfer" && (
										<div className="grid gap-4 md:grid-cols-2">
											<div>
												<Label
													htmlFor="accountNumber"
													className="text-base font-medium">
													Account Number
												</Label>
												<Input
													id="accountNumber"
													placeholder="Enter account number"
													{...form.register("beneficiaryDetails.accountNumber")}
													className="mt-2"
												/>
											</div>
											<div>
												<Label
													htmlFor="bankName"
													className="text-base font-medium">
													Bank Name
												</Label>
												<Input
													id="bankName"
													placeholder="Enter bank name"
													{...form.register("beneficiaryDetails.bankName")}
													className="mt-2"
												/>
											</div>
											<div className="md:col-span-2">
												<Label
													htmlFor="ifscCode"
													className="text-base font-medium">
													IFSC Code
												</Label>
												<Input
													id="ifscCode"
													placeholder="Enter IFSC code"
													{...form.register("beneficiaryDetails.ifscCode")}
													className="mt-2"
												/>
											</div>
										</div>
									)}
								</div>

								{/* Submit Button */}
								<div className="flex gap-4 pt-4">
									<Button
										type="submit"
										disabled={isSubmitting || closeCaseMutation.isPending}
										className="flex-1">
										{isSubmitting || closeCaseMutation.isPending ? (
											<>
												<Skeleton className="size-4 mr-2" />
												Closing Case...
											</>
										) : (
											<>
												<Save className="size-4 mr-2" />
												Close Case
											</>
										)}
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => router.back()}
										disabled={isSubmitting || closeCaseMutation.isPending}>
										Cancel
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Case Summary */}
				<div className="space-y-6">
					{/* Case Summary */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="size-5" />
								Case Summary
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="text-sm font-medium text-muted-foreground">
									Victim Name
								</label>
								<p className="text-lg font-semibold">{caseItem.victim.name}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-muted-foreground">
									Relative
								</label>
								<p className="text-lg">{caseItem.victim.relative.name}</p>
								<p className="text-sm text-muted-foreground">
									{caseItem.victim.relative.contact}
								</p>
							</div>
							<div>
								<label className="text-sm font-medium text-muted-foreground">
									Current Stage
								</label>
								<p className="text-lg font-semibold">
									{getStageDisplayName(caseItem.stage)}
								</p>
							</div>
							<div>
								<label className="text-sm font-medium text-muted-foreground">
									Documents
								</label>
								<p className="text-lg">{caseItem.documents.length} uploaded</p>
							</div>
						</CardContent>
					</Card>

					{/* Payment Method Preview */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								{getPaymentMethodIcon(form.watch("paymentMethod"))}
								Payment Method
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Method
									</label>
									<p className="text-lg font-semibold">
										{getPaymentMethodLabel(form.watch("paymentMethod"))}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Amount
									</label>
									<p className="text-2xl font-bold text-green-600">
										₹{form.watch("amount")?.toLocaleString() || "0"}
									</p>
								</div>
								{form.watch("paymentMethod") === "bank_transfer" && (
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Beneficiary
										</label>
										<p className="text-lg">
											{form.watch("beneficiaryDetails.name") || "Not specified"}
										</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Case Timeline */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="size-5" />
								Case Timeline
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Created
									</label>
									<p className="text-sm">
										{format(new Date(caseItem.createdAt), "MMM dd, yyyy")}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Last Updated
									</label>
									<p className="text-sm">
										{format(new Date(caseItem.updatedAt), "MMM dd, yyyy")}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Total Remarks
									</label>
									<p className="text-sm">{caseItem.remarks.length} entries</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

export default CloseCasePage;
