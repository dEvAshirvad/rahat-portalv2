"use client";

import { useCaseStats } from "@/queries/overview";
import { useSession } from "@/queries/auth";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	FileText,
	Clock,
	CheckCircle,
	XCircle,
	Archive,
	TrendingUp,
	Users,
	Activity,
	Loader2,
	BarChart3,
	Calendar,
	Target,
} from "lucide-react";
import Link from "next/link";

export default function OverviewPage() {
	const { data: session } = useSession();
	const { data: statsData, isLoading, error } = useCaseStats();

	const stats = statsData?.data;

	// Helper function to format stage names
	const formatStageName = (stage: string) => {
		return stage.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
	};

	// Calculate percentages
	const getPercentage = (value: number, total: number) => {
		return total > 0 ? Math.round((value / total) * 100) : 0;
	};

	// Get stage color
	const getStageColor = (stage: string) => {
		const colors: { [key: string]: string } = {
			sdm_review: "bg-blue-500",
			tehsildar_review: "bg-yellow-500",
			thana_incharge_review: "bg-orange-500",
			collector_approval: "bg-purple-500",
			approved: "bg-green-500",
			rejected: "bg-red-500",
			closed: "bg-gray-500",
		};
		return colors[stage] || "bg-gray-500";
	};

	if (isLoading) {
		return (
			<div className="container mx-auto py-6 space-y-6">
				<div className="flex items-center justify-center py-12">
					<Loader2 className="size-8 animate-spin" />
					<span className="ml-2 text-lg">Loading overview data...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto py-6 space-y-6">
				<div className="flex items-center justify-center py-12">
					<div className="text-center">
						<XCircle className="size-12 text-red-500 mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
						<p className="text-muted-foreground">
							Failed to load overview statistics.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-6 space-y-6">
			{/* Header */}
			<div className="bg-gradient-to-r from-emerald-600 via-blue-700 to-slate-700 rounded-lg p-6 text-white">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold mb-2 capitalize">
							Overview Dashboard
						</h1>
						<h1 className="text-3xl font-bold mb-2 capitalize">
							Welcome back, {session?.user?.name}
						</h1>
						<p className="text-emerald-100 text-sm font-medium capitalize">
							Role: {session?.user?.rahatRole} • Department: Revenue Department
						</p>
					</div>
				</div>
			</div>

			{/* Main Statistics Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Cases</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.total || 0}</div>
						<p className="text-xs text-muted-foreground">
							All cases in the system
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending Cases</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-yellow-600">
							{stats?.pending || 0}
						</div>
						<p className="text-xs text-muted-foreground">
							{getPercentage(stats?.pending || 0, stats?.total || 0)}% of total
							cases
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Approved Cases
						</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{stats?.approved || 0}
						</div>
						<p className="text-xs text-muted-foreground">
							{getPercentage(stats?.approved || 0, stats?.total || 0)}% of total
							cases
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Rejected Cases
						</CardTitle>
						<XCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">
							{stats?.rejected || 0}
						</div>
						<p className="text-xs text-muted-foreground">
							{getPercentage(stats?.rejected || 0, stats?.total || 0)}% of total
							cases
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Secondary Statistics */}
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Closed Cases</CardTitle>
						<Archive className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-gray-600">
							{stats?.closed || 0}
						</div>
						<p className="text-xs text-muted-foreground">
							{getPercentage(stats?.closed || 0, stats?.total || 0)}% of total
							cases
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Processing Rate
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-600">
							{getPercentage(
								(stats?.approved || 0) +
									(stats?.rejected || 0) +
									(stats?.closed || 0),
								stats?.total || 0
							)}
							%
						</div>
						<p className="text-xs text-muted-foreground">
							Cases processed (approved + rejected + closed)
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Workflow Distribution */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BarChart3 className="h-5 w-5" />
						Workflow Distribution
					</CardTitle>
					<CardDescription>
						Breakdown of cases by workflow stage
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{stats?.byStage && stats.byStage.length > 0 ? (
						<div className="space-y-4">
							{stats.byStage.map((stage) => (
								<div key={stage.stage} className="space-y-2">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div
												className={`w-3 h-3 rounded-full ${getStageColor(
													stage.stage
												)}`}></div>
											<span className="text-sm font-medium">
												{formatStageName(stage.stage)}
											</span>
											<Badge variant="outline" className="text-xs">
												{stage.count} cases
											</Badge>
										</div>
										<span className="text-sm text-muted-foreground">
											{getPercentage(stage.count, stats.total)}%
										</span>
									</div>
									<Progress
										value={getPercentage(stage.count, stats.total)}
										className="h-2"
									/>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<Activity className="size-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">No Workflow Data</h3>
							<p className="text-muted-foreground">
								No cases are currently in workflow stages.
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Target className="h-5 w-5" />
						Quick Actions
					</CardTitle>
					<CardDescription>Common actions for case management</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						<Link
							href="/cases"
							className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
							<FileText className="h-5 w-5 text-blue-600" />
							<div>
								<p className="font-medium">View All Cases</p>
								<p className="text-sm text-muted-foreground">
									Browse all cases
								</p>
							</div>
						</Link>
						<Link
							href="/"
							className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
							<Clock className="h-5 w-5 text-yellow-600" />
							<div>
								<p className="font-medium">Pending Cases</p>
								<p className="text-sm text-muted-foreground">
									Review pending cases
								</p>
							</div>
						</Link>
						<Link
							href="/admin"
							className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
							<Users className="h-5 w-5 text-green-600" />
							<div>
								<p className="font-medium">User Management</p>
								<p className="text-sm text-muted-foreground">
									Manage system users
								</p>
							</div>
						</Link>
					</div>
				</CardContent>
			</Card>

			{/* Summary */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Summary
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<h4 className="font-semibold mb-2">Case Status Overview</h4>
							<ul className="space-y-1 text-sm text-muted-foreground">
								<li>• Total cases in system: {stats?.total || 0}</li>
								<li>• Cases pending review: {stats?.pending || 0}</li>
								<li>• Successfully approved: {stats?.approved || 0}</li>
								<li>• Cases rejected: {stats?.rejected || 0}</li>
								<li>• Cases closed: {stats?.closed || 0}</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold mb-2">Workflow Stages</h4>
							<ul className="space-y-1 text-sm text-muted-foreground">
								{stats?.byStage?.map((stage) => (
									<li key={stage.stage}>
										• {formatStageName(stage.stage)}: {stage.count} cases
									</li>
								))}
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
