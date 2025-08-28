"use client";

import { useState } from "react";
import {
	useListUsers,
	createUserMutation,
	updateUserMutation,
	banUserMutation,
	setUserPasswordMutation,
	type ListUsersParams,
	type User,
} from "@/queries/admin";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
	Plus,
	Search,
	Filter,
	Edit,
	Ban,
	Key,
	Eye,
	MoreHorizontal,
	Loader2,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

// Form schemas
const createUserSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	name: z.string().min(2, "Name must be at least 2 characters"),
	rahatRole: z.string().min(1, "Role is required"),
	jurisdiction: z.string().optional(),
});

const updateUserSchema = z.object({
	email: z.string().email("Invalid email address"),
	name: z.string().min(2, "Name must be at least 2 characters"),
	rahatRole: z.string().min(1, "Role is required"),
	jurisdiction: z.string().optional(),
});

const setPasswordSchema = z.object({
	newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

const banUserSchema = z.object({
	banReason: z.string().min(1, "Ban reason is required"),
	banExpiresIn: z.string().optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;
type SetPasswordFormData = z.infer<typeof setPasswordSchema>;
type BanUserFormData = z.infer<typeof banUserSchema>;

const RAHAT_ROLES = [
	"collector",
	"additional-collector",
	"sdm",
	"tehsildar",
	"thana-incharge",
	"rahat-shakha",
	"oic",
];

export default function UserManagement() {
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const [searchParams, setSearchParams] = useState<ListUsersParams>({
		limit: pageSize,
		offset: (currentPage - 1) * pageSize,
		searchField: "name",
		searchOperator: "contains",
	});

	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
	const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
	const [banDialogOpen, setBanDialogOpen] = useState(false);

	// Queries and mutations
	const { data: usersData, isLoading, refetch } = useListUsers(searchParams);
	const createUserMutationFn = createUserMutation();
	const updateUserMutationFn = updateUserMutation();
	const banUserMutationFn = banUserMutation();
	const setPasswordMutationFn = setUserPasswordMutation();

	// Forms
	const createForm = useForm<CreateUserFormData>({
		resolver: zodResolver(createUserSchema),
		defaultValues: {
			email: "",
			password: "",
			name: "",
			rahatRole: "",
			jurisdiction: "",
		},
	});

	const updateForm = useForm<UpdateUserFormData>({
		resolver: zodResolver(updateUserSchema),
	});

	const passwordForm = useForm<SetPasswordFormData>({
		resolver: zodResolver(setPasswordSchema),
		defaultValues: {
			newPassword: "",
		},
	});

	const banForm = useForm<BanUserFormData>({
		resolver: zodResolver(banUserSchema),
		defaultValues: {
			banReason: "",
			banExpiresIn: "",
		},
	});

	// Handlers
	const handleSearch = (value: string) => {
		setCurrentPage(1); // Reset to first page when searching
		setSearchParams((prev) => ({
			...prev,
			searchValue: value,
			limit: pageSize,
			offset: 0,
		}));
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		setSearchParams((prev) => ({
			...prev,
			limit: pageSize,
			offset: (page - 1) * pageSize,
		}));
	};

	const handlePageSizeChange = (newPageSize: number) => {
		setPageSize(newPageSize);
		setCurrentPage(1); // Reset to first page when changing page size
		setSearchParams((prev) => ({
			...prev,
			limit: newPageSize,
			offset: 0,
		}));
	};

	const handleCreateUser = async (data: CreateUserFormData) => {
		try {
			await createUserMutationFn.mutateAsync({
				email: data.email,
				password: data.password,
				name: data.name,
				data: {
					rahatRole: data.rahatRole,
					jurisdiction: data.jurisdiction,
				},
			});

			toast.success("User created successfully!");
			createForm.reset();
			setCreateDialogOpen(false);
			refetch();
		} catch (error: any) {
			toast.error(error?.message || "Failed to create user");
		}
	};

	const handleUpdateUser = async (data: UpdateUserFormData) => {
		if (!selectedUser) return;

		try {
			await updateUserMutationFn.mutateAsync({
				userId: selectedUser.id,
				data: {
					email: data.email,
					name: data.name,
					rahatRole: data.rahatRole,
					jurisdiction: data.jurisdiction,
				},
			});

			toast.success("User updated successfully!");
			setUpdateDialogOpen(false);
			setSelectedUser(null);
			refetch();
		} catch (error: any) {
			toast.error(error?.message || "Failed to update user");
		}
	};

	const handleSetPassword = async (data: SetPasswordFormData) => {
		if (!selectedUser) return;

		try {
			await setPasswordMutationFn.mutateAsync({
				userId: selectedUser.id,
				newPassword: data.newPassword,
			});

			toast.success("Password updated successfully!");
			setPasswordDialogOpen(false);
			setSelectedUser(null);
			passwordForm.reset();
		} catch (error: any) {
			toast.error(error?.message || "Failed to update password");
		}
	};

	const handleBanUser = async (data: BanUserFormData) => {
		if (!selectedUser) return;

		try {
			await banUserMutationFn.mutateAsync({
				userId: selectedUser.id,
				banReason: data.banReason,
				banExpiresIn:
					data.banExpiresIn === "permanent" ? undefined : data.banExpiresIn,
			});

			toast.success("User banned successfully!");
			setBanDialogOpen(false);
			setSelectedUser(null);
			banForm.reset();
			refetch();
		} catch (error: any) {
			toast.error(error?.message || "Failed to ban user");
		}
	};

	const openUpdateDialog = (user: User) => {
		setSelectedUser(user);
		updateForm.reset({
			email: user.email,
			name: user.name,
			rahatRole: user.rahatRole,
			jurisdiction: user.jurisdiction || "",
		});
		setUpdateDialogOpen(true);
	};

	const openPasswordDialog = (user: User) => {
		setSelectedUser(user);
		setPasswordDialogOpen(true);
	};

	const openBanDialog = (user: User) => {
		setSelectedUser(user);
		setBanDialogOpen(true);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">User Management</h2>
					<p className="text-muted-foreground">
						Manage system users, roles, and permissions.
					</p>
				</div>
				<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="size-4 mr-2" />
							Create User
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Create New User</DialogTitle>
							<DialogDescription>
								Add a new user to the system with appropriate role and
								jurisdiction.
							</DialogDescription>
						</DialogHeader>
						<Form {...createForm}>
							<form
								onSubmit={createForm.handleSubmit(handleCreateUser)}
								className="space-y-4">
								<FormField
									control={createForm.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name</FormLabel>
											<FormControl>
												<Input placeholder="Enter full name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={createForm.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input placeholder="Enter email address" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={createForm.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Password</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder="Enter password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={createForm.control}
									name="rahatRole"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Role</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select a role" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{RAHAT_ROLES.map((role) => (
														<SelectItem key={role} value={role}>
															{role.replace(/-/g, " ").toUpperCase()}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={createForm.control}
									name="jurisdiction"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Jurisdiction (Optional)</FormLabel>
											<FormControl>
												<Input placeholder="Enter jurisdiction" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => setCreateDialogOpen(false)}
										disabled={createUserMutationFn.isPending}>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={createUserMutationFn.isPending}>
										{createUserMutationFn.isPending ? (
											<>
												<Loader2 className="size-4 mr-2 animate-spin" />
												Creating...
											</>
										) : (
											"Create User"
										)}
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Search and Filters */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
							<Input
								placeholder="Search users..."
								className="pl-10"
								onChange={(e) => handleSearch(e.target.value)}
							/>
						</div>
						<Select
							value={searchParams.searchField}
							onValueChange={(value: "email" | "name") =>
								setSearchParams((prev) => ({ ...prev, searchField: value }))
							}>
							<SelectTrigger className="w-[180px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="name">Search by Name</SelectItem>
								<SelectItem value="email">Search by Email</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Users Table */}
			<Card>
				<CardHeader>
					<CardTitle>Users ({usersData?.total || 0})</CardTitle>
					<CardDescription>
						Manage system users and their permissions.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="size-6 animate-spin" />
							<span className="ml-2">Loading users...</span>
						</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Jurisdiction</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{usersData?.users.map((user) => (
										<TableRow key={user.id}>
											<TableCell className="font-medium">{user.name}</TableCell>
											<TableCell>{user.email}</TableCell>
											<TableCell>
												<Badge variant="outline">
													{user.rahatRole.replace(/-/g, " ").toUpperCase()}
												</Badge>
											</TableCell>
											<TableCell>{user.jurisdiction || "-"}</TableCell>
											<TableCell>
												{user.banned ? (
													<Badge variant="destructive">Banned</Badge>
												) : (
													<Badge variant="default">Active</Badge>
												)}
											</TableCell>
											<TableCell>
												{format(new Date(user.createdAt), "MMM dd, yyyy")}
											</TableCell>
											<TableCell className="text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreHorizontal className="size-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() => openUpdateDialog(user)}>
															<Edit className="size-4 mr-2" />
															Edit User
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => openPasswordDialog(user)}>
															<Key className="size-4 mr-2" />
															Set Password
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => openBanDialog(user)}>
															<Ban className="size-4 mr-2" />
															Ban User
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>

							{/* Pagination Controls */}
							{usersData && usersData.total > 0 && (
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
											{Math.ceil(usersData.total / pageSize)}
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
													currentPage === Math.ceil(usersData.total / pageSize)
												}>
												<span className="sr-only">Go to next page</span>
												<ChevronRight className="h-4 w-4" />
											</Button>
											<Button
												variant="outline"
												className="hidden h-8 w-8 p-0 lg:flex"
												onClick={() =>
													handlePageChange(
														Math.ceil(usersData.total / pageSize)
													)
												}
												disabled={
													currentPage === Math.ceil(usersData.total / pageSize)
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

			{/* Update User Dialog */}
			<Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Update User</DialogTitle>
						<DialogDescription>
							Update user information and role.
						</DialogDescription>
					</DialogHeader>
					<Form {...updateForm}>
						<form
							onSubmit={updateForm.handleSubmit(handleUpdateUser)}
							className="space-y-4">
							<FormField
								control={updateForm.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input placeholder="Enter email address" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={updateForm.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input placeholder="Enter full name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={updateForm.control}
								name="rahatRole"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Role</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Select a role" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{RAHAT_ROLES.map((role) => (
													<SelectItem key={role} value={role}>
														{role.replace(/-/g, " ").toUpperCase()}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={updateForm.control}
								name="jurisdiction"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Jurisdiction (Optional)</FormLabel>
										<FormControl>
											<Input placeholder="Enter jurisdiction" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => setUpdateDialogOpen(false)}
									disabled={updateUserMutationFn.isPending}>
									Cancel
								</Button>
								<Button type="submit" disabled={updateUserMutationFn.isPending}>
									{updateUserMutationFn.isPending ? (
										<>
											<Loader2 className="size-4 mr-2 animate-spin" />
											Updating...
										</>
									) : (
										"Update User"
									)}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			{/* Set Password Dialog */}
			<Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Set User Password</DialogTitle>
						<DialogDescription>
							Set a new password for {selectedUser?.name}.
						</DialogDescription>
					</DialogHeader>
					<Form {...passwordForm}>
						<form
							onSubmit={passwordForm.handleSubmit(handleSetPassword)}
							className="space-y-4">
							<FormField
								control={passwordForm.control}
								name="newPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>New Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="Enter new password"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => setPasswordDialogOpen(false)}
									disabled={setPasswordMutationFn.isPending}>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={setPasswordMutationFn.isPending}>
									{setPasswordMutationFn.isPending ? (
										<>
											<Loader2 className="size-4 mr-2 animate-spin" />
											Updating...
										</>
									) : (
										"Set Password"
									)}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			{/* Ban User Dialog */}
			<Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Ban User</DialogTitle>
						<DialogDescription>
							Ban {selectedUser?.name} from accessing the system.
						</DialogDescription>
					</DialogHeader>
					<Form {...banForm}>
						<form
							onSubmit={banForm.handleSubmit(handleBanUser)}
							className="space-y-4">
							<FormField
								control={banForm.control}
								name="banReason"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Ban Reason</FormLabel>
										<FormControl>
											<Input placeholder="Enter ban reason" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={banForm.control}
								name="banExpiresIn"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Ban Duration (Optional)</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select duration" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="P1D">1 Day</SelectItem>
												<SelectItem value="P7D">1 Week</SelectItem>
												<SelectItem value="P30D">1 Month</SelectItem>
												<SelectItem value="P90D">3 Months</SelectItem>
												<SelectItem value="P365D">1 Year</SelectItem>
												<SelectItem value="permanent">Permanent</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => setBanDialogOpen(false)}
									disabled={banUserMutationFn.isPending}>
									Cancel
								</Button>
								<Button
									type="submit"
									variant="destructive"
									disabled={banUserMutationFn.isPending}>
									{banUserMutationFn.isPending ? (
										<>
											<Loader2 className="size-4 mr-2 animate-spin" />
											Banning...
										</>
									) : (
										"Ban User"
									)}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
