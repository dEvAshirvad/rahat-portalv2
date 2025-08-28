import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { Book, BookCheck, Ellipsis, Clock, CheckCircle } from "lucide-react";
import React from "react";
import { useCaseStats } from "@/queries/cases";
import { Skeleton } from "@/components/ui/skeleton";

function RahatCases() {
	const { data: statsData, isLoading, error } = useCaseStats();

	// Define card configurations
	const cards = [
		{
			title: "Total Cases",
			icon: Book,
			value: statsData?.data?.total || 0,
			percentage: 0, // API doesn't provide percentage change
			change: {
				value: 0,
				duration: "total",
			},
		},
		{
			title: "Pending Cases",
			icon: Clock,
			value: statsData?.data?.pending || 0,
			percentage: 0,
			change: {
				value: 0,
				duration: "pending",
			},
		},
		{
			title: "Approved Cases",
			icon: CheckCircle,
			value: statsData?.data?.approved || 0,
			percentage: 0,
			change: {
				value: 0,
				duration: "approved",
			},
		},
		{
			title: "Closed Cases",
			icon: BookCheck,
			value: statsData?.data?.closed || 0,
			percentage: 0,
			change: {
				value: 0,
				duration: "closed",
			},
		},
	];

	if (isLoading) {
		return (
			<div className="grid grid-cols-4 gap-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<Card key={index} className="@container/card">
						<CardHeader className="flex flex-col gap-4">
							<div className="flex items-center justify-between w-full">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-4" />
							</div>
							<div className="flex flex-col gap-4">
								<Skeleton className="h-8 w-16" />
								<Skeleton className="h-3 w-20" />
							</div>
						</CardHeader>
					</Card>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="grid grid-cols-4 gap-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<Card key={index} className="@container/card">
						<CardHeader className="flex flex-col gap-4">
							<div className="flex items-center justify-between w-full">
								<div className="text-sm text-muted-foreground">
									Error loading data
								</div>
							</div>
							<div className="flex flex-col gap-4">
								<div className="text-2xl font-semibold">--</div>
								<div className="text-xs text-muted-foreground">
									Unable to load statistics
								</div>
							</div>
						</CardHeader>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-4 gap-4">
			{cards.map((card) => (
				<Card className="@container/card" key={card.title}>
					<CardHeader className="flex flex-col gap-4">
						<div className="flex items-center justify-between w-full">
							<div className="flex items-center gap-1.5">
								<card.icon className="size-4" />
								<CardDescription className="text-foreground font-semibold">
									{card.title}
								</CardDescription>
							</div>
							<Ellipsis className="size-4" />
						</div>
						<div className="flex flex-col gap-4">
							<CardTitle className="text-2xl leading-none font-semibold tabular-nums @[250px]/card:text-3xl">
								{Intl.NumberFormat("en-US", {
									notation: "compact",
								}).format(card.value)}
							</CardTitle>
						</div>
					</CardHeader>
				</Card>
			))}
		</div>
	);
}

export default RahatCases;
