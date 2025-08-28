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
import { useUpdateWorkflow, useWorkflowStatus } from "@/queries/cases";
import { toast } from "sonner";
import { Loader2, Edit } from "lucide-react";
import {
	Select,
	SelectValue,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";
import FileUploader from "../comp-549";
import { AxiosError } from "axios";

// Form validation schema
const workflowUpdateSchema = z.object({
	remark: z.string().min(1, "Remark is required"),
	action: z.string().min(1, "Action is required"),
});

type WorkflowUpdateFormData = z.infer<typeof workflowUpdateSchema>;

interface WorkflowUpdateDialogProps {
	caseId: string;
	onSuccess?: () => void;
}

export default function WorkflowUpdateDialog({
	caseId,
	onSuccess,
}: WorkflowUpdateDialogProps) {
	const [open, setOpen] = useState(false);
	const updateWorkflowMutation = useUpdateWorkflow();

	// Fetch workflow status for available actions
	const {
		data: workflowStatusData,
		isLoading: workflowStatusLoading,
		isFetched,
	} = useWorkflowStatus(caseId);

	const form = useForm<WorkflowUpdateFormData>({
		resolver: zodResolver(workflowUpdateSchema),
		defaultValues: {
			remark: "",
			action: "",
		},
	});

	const onSubmit = async (data: WorkflowUpdateFormData) => {
		try {
			await updateWorkflowMutation.mutateAsync({
				caseId,
				data: {
					action: data.action as
						| "forward"
						| "approve"
						| "reject"
						| "terminate"
						| "release_notice",
					remark: data.remark,
				},
			});
			toast.success("Workflow updated successfully!");
			form.reset();
			setOpen(false);
			onSuccess?.();
		} catch (error) {
			if (error instanceof AxiosError) {
				toast.error(
					error?.response?.data?.title || "Failed to update workflow",
					{
						description: error?.response?.data?.message,
						className: "bg-destructive/10 text-destructive",
					}
				);
			} else {
				toast.error("Failed to update workflow");
			}
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen && updateWorkflowMutation.isPending) return;
		setOpen(newOpen);
		if (!newOpen) {
			form.reset();
		}
	};

	const availableActions = workflowStatusData?.data?.availableActions || [];

	return (
		isFetched &&
		availableActions.length > 0 && (
			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogTrigger asChild>
					<Button variant="outline" size="icon">
						<Edit className="size-4" />
					</Button>
				</DialogTrigger>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Update Workflow</DialogTitle>
						<DialogDescription>
							Select an action and add a remark to update the case workflow.
						</DialogDescription>
					</DialogHeader>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							{/* Available Actions */}
							<FormField
								control={form.control}
								name="action"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Action *</FormLabel>
										<FormControl>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select action" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{availableActions.map((action) => (
														<SelectItem key={action} value={action}>
															{action.replace(/_/g, " ").toUpperCase()}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Remark Input */}
							{form.watch("action") && (
								<FormField
									control={form.control}
									name="remark"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Remark *</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Enter your remark for this action..."
													className="min-h-[100px]"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => setOpen(false)}
									disabled={updateWorkflowMutation.isPending}>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={
										updateWorkflowMutation.isPending || !form.formState.isValid
									}>
									{updateWorkflowMutation.isPending ? (
										<>
											<Loader2 className="size-4 mr-2 animate-spin" />
											Updating...
										</>
									) : (
										"Update Workflow"
									)}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		)
	);
}
