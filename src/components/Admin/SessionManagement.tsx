"use client";

import { useState } from "react";
import { useListUserSessions } from "@/queries/admin";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
	Search,
	Eye,
	Loader2,
	Monitor,
	Clock,
	Globe,
	User,
} from "lucide-react";
import { format } from "date-fns";

export default function SessionManagement() {
	const [selectedUserId, setSelectedUserId] = useState<string>("");
	const [sessionDialogOpen, setSessionDialogOpen] = useState(false);

	const {
		data: sessionsData,
		isLoading,
		refetch,
	} = useListUserSessions(selectedUserId);

	const handleViewSessions = (userId: string) => {
		setSelectedUserId(userId);
		setSessionDialogOpen(true);
	};

	const isSessionExpired = (expiresAt: string) => {
		return new Date(expiresAt) < new Date();
	};

	const getSessionStatus = (expiresAt: string) => {
		return isSessionExpired(expiresAt) ? "Expired" : "Active";
	};

	const getSessionStatusVariant = (expiresAt: string) => {
		return isSessionExpired(expiresAt) ? "destructive" : "default";
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-2xl font-bold tracking-tight">
					Session Management
				</h2>
				<p className="text-muted-foreground">
					Monitor and manage user sessions across the system.
				</p>
			</div>

			{/* Session Overview */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Sessions
						</CardTitle>
						<Monitor className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{sessionsData?.sessions?.length || 0}
						</div>
						<p className="text-xs text-muted-foreground">
							Active user sessions
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Sessions
						</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{sessionsData?.sessions?.filter(
								(s) => !isSessionExpired(s.expiresAt)
							).length || 0}
						</div>
						<p className="text-xs text-muted-foreground">
							Non-expired sessions
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Expired Sessions
						</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{sessionsData?.sessions?.filter((s) =>
								isSessionExpired(s.expiresAt)
							).length || 0}
						</div>
						<p className="text-xs text-muted-foreground">Expired sessions</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Unique Users</CardTitle>
						<User className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{new Set(sessionsData?.sessions?.map((s) => s.userId) || []).size}
						</div>
						<p className="text-xs text-muted-foreground">Users with sessions</p>
					</CardContent>
				</Card>
			</div>

			{/* Session List */}
			<Card>
				<CardHeader>
					<CardTitle>User Sessions</CardTitle>
					<CardDescription>
						View and manage active user sessions. Click on a user to view their
						sessions.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* This would typically show a list of users with session counts */}
					<div className="text-center py-8">
						<Monitor className="size-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">Session Management</h3>
						<p className="text-muted-foreground mb-4">
							Select a user from the User Management tab to view their sessions.
						</p>
						<Button onClick={() => setSessionDialogOpen(true)}>
							<Eye className="size-4 mr-2" />
							View All Sessions
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Sessions Dialog */}
			<Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
				<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>User Sessions</DialogTitle>
						<DialogDescription>
							View detailed session information for all users.
						</DialogDescription>
					</DialogHeader>

					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="size-6 animate-spin" />
							<span className="ml-2">Loading sessions...</span>
						</div>
					) : sessionsData?.sessions && sessionsData.sessions.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>User ID</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>IP Address</TableHead>
									<TableHead>User Agent</TableHead>
									<TableHead>Created</TableHead>
									<TableHead>Expires</TableHead>
									<TableHead>Impersonated By</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sessionsData.sessions.map((session) => (
									<TableRow key={session.id}>
										<TableCell className="font-mono text-sm">
											{session.userId}
										</TableCell>
										<TableCell>
											<Badge
												variant={getSessionStatusVariant(session.expiresAt)}>
												{getSessionStatus(session.expiresAt)}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Globe className="size-3" />
												{session.ipAddress}
											</div>
										</TableCell>
										<TableCell className="max-w-[200px] truncate">
											{session.userAgent}
										</TableCell>
										<TableCell>
											{format(
												new Date(session.createdAt),
												"MMM dd, yyyy HH:mm"
											)}
										</TableCell>
										<TableCell>
											{format(
												new Date(session.expiresAt),
												"MMM dd, yyyy HH:mm"
											)}
										</TableCell>
										<TableCell>
											{session.impersonatedBy ? (
												<Badge variant="outline">
													{session.impersonatedBy}
												</Badge>
											) : (
												<span className="text-muted-foreground">-</span>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<div className="text-center py-8">
							<Monitor className="size-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">No Sessions Found</h3>
							<p className="text-muted-foreground">
								No user sessions are currently available.
							</p>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
