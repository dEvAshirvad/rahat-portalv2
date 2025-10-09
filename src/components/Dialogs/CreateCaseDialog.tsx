"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useCreateCase, useThanaInchargeSearch } from "@/queries/cases";
import { toast } from "sonner";
import { Plus, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AxiosError } from "axios";

const caseTypeZodEnum = z.enum(["unnatural-death", "hit-and-run"]);

// Form validation schema
const createCaseSchema = z.object({
	caseType: caseTypeZodEnum,
	victim: z.object({
		name: z.string().min(1, "Victim name is required"),
		dob: z.string().min(1, "Date of birth is required"),
		dod: z.string().min(1, "Date of death is required"),
		address: z.string().min(1, "Address is required"),
		description: z.string().min(1, "Description is required"),
		relative: z.object({
			name: z.string().min(1, "Relative name is required"),
			contact: z.string().min(10, "Contact number must be at least 10 digits"),
			relation: z.string().min(1, "Relation is required"),
		}),
	}),
	thanaInchargeId: z.string().min(1, "Thana Incharge is required"),
});

type CreateCaseFormData = z.infer<typeof createCaseSchema>;

interface CreateCaseDialogProps {
	onSuccess?: () => void;
}

export default function CreateCaseDialog({ onSuccess }: CreateCaseDialogProps) {
	const [open, setOpen] = useState(false);
	const createCaseMutation = useCreateCase();
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [thanaInchargeOpen, setThanaInchargeOpen] = useState(false);

	// Debounce search input with 2-second delay
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
		}, 2000); // 2 seconds delay

		return () => clearTimeout(timer);
	}, [search]);

	// Fetch thana incharge data with debounced search
	const { data: thanaInchargeData, isLoading: thanaInchargeLoading } =
		useThanaInchargeSearch({
			page: 1,
			limit: 50,
			q: debouncedSearch,
		});

	const form = useForm<CreateCaseFormData>({
		resolver: zodResolver(createCaseSchema),
		defaultValues: {
			caseType: "unnatural-death",
			victim: {
				name: "",
				dob: "",
				dod: "",
				address: "",
				description: "",
				relative: {
					name: "",
					contact: "",
					relation: "",
				},
			},
			thanaInchargeId: "",
		},
	});

	const onSubmit = async (data: CreateCaseFormData) => {
		try {
			await createCaseMutation.mutateAsync(data);
			toast.success("Case created successfully!");
			form.reset();
			setOpen(false);
			onSuccess?.();
		} catch (error) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data.message || "Failed to create case");
			}
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen && createCaseMutation.isPending) return; // Prevent closing while submitting
		setOpen(newOpen);
		if (!newOpen) {
			form.reset();
		}
	};

	// Get selected thana incharge name for display
	const selectedThanaIncharge = thanaInchargeData?.data?.docs?.find(
		(thanaIncharge) => thanaIncharge._id === form.watch("thanaInchargeId")
	);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="size-4 mr-2" />
					Add Case
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create New Case</DialogTitle>
					<DialogDescription>
						Enter the victim details and case information to create a new case.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Victim Information */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Victim Information</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="caseType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Case Type *</FormLabel>
											<FormControl>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select case type" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="unnatural-death">
															Unnatural Death
														</SelectItem>
														<SelectItem value="hit-and-run">
															Hit and Run
														</SelectItem>
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="victim.name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Victim Name *</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter victim's full name"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="victim.dob"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Date of Birth *</FormLabel>
											<FormControl>
												<Input type="date" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="victim.dod"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Date of Death *</FormLabel>
											<FormControl>
												<Input type="date" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="victim.address"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Address *</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter victim's address"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="victim.description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Case Description *</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Describe the incident or case details"
												className="min-h-[100px]"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Relative Information */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Relative Information</h3>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<FormField
									control={form.control}
									name="victim.relative.name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Relative Name *</FormLabel>
											<FormControl>
												<Input placeholder="Enter relative's name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="victim.relative.contact"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Contact Number *</FormLabel>
											<FormControl>
												<Input placeholder="Enter contact number" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="victim.relative.relation"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Relation *</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select relation" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="spouse">Spouse</SelectItem>
													<SelectItem value="son">Son</SelectItem>
													<SelectItem value="daughter">Daughter</SelectItem>
													<SelectItem value="father">Father</SelectItem>
													<SelectItem value="mother">Mother</SelectItem>
													<SelectItem value="brother">Brother</SelectItem>
													<SelectItem value="sister">Sister</SelectItem>
													<SelectItem value="other">Other</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Thana Incharge Assignment */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Case Assignment</h3>

							<FormField
								control={form.control}
								name="thanaInchargeId"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Assign to Thana Incharge *</FormLabel>
										<Popover
											open={thanaInchargeOpen}
											onOpenChange={setThanaInchargeOpen}>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														role="combobox"
														aria-expanded={thanaInchargeOpen}
														className="w-full justify-between"
														disabled={thanaInchargeLoading}>
														{field.value
															? selectedThanaIncharge
																? `${selectedThanaIncharge.name} - ${selectedThanaIncharge.jurisdiction}`
																: "Select thana incharge"
															: thanaInchargeLoading
															? "Loading thana incharge..."
															: "Select thana incharge"}
														<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
												<Command>
													<CommandInput
														placeholder="Search thana incharge... (2s delay)"
														value={search}
														onValueChange={setSearch}
													/>
													<CommandList>
														<CommandEmpty>
															{thanaInchargeLoading
																? "Loading..."
																: search !== debouncedSearch
																? "Type to search..."
																: "No thana incharge found."}
														</CommandEmpty>
														<CommandGroup>
															{thanaInchargeData?.data?.docs?.map(
																(thanaIncharge) => (
																	<CommandItem
																		key={thanaIncharge._id}
																		value={`${thanaIncharge.name} ${thanaIncharge.jurisdiction}`}
																		onSelect={() => {
																			field.onChange(thanaIncharge._id);
																			setThanaInchargeOpen(false);
																			setSearch("");
																			setDebouncedSearch("");
																		}}>
																		<Check
																			className={cn(
																				"mr-2 h-4 w-4",
																				field.value === thanaIncharge._id
																					? "opacity-100"
																					: "opacity-0"
																			)}
																		/>
																		{thanaIncharge.name} -{" "}
																		{thanaIncharge.jurisdiction}
																	</CommandItem>
																)
															)}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={createCaseMutation.isPending}>
								Cancel
							</Button>
							<Button type="submit" disabled={createCaseMutation.isPending}>
								{createCaseMutation.isPending ? (
									<>
										<Loader2 className="size-4 mr-2 animate-spin" />
										Creating...
									</>
								) : (
									"Create Case"
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
