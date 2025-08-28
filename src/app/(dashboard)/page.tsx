"use client";

import RahatCases from "@/components/Cards/RahatCases/RahatCases";
import RahatCasesTable from "@/components/DataTable/RahatCases/RahatCasesTable";
import CreateCaseDialog from "@/components/Dialogs/CreateCaseDialog";
import { useSession } from "@/queries/auth";
import { usePendingCases } from "@/queries/cases";
import { useState } from "react";

export default function Home() {
	const { data: session } = useSession();

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const { data: pendingCasesData, isLoading } = usePendingCases({
		page,
		limit: pageSize,
	});

	const handlePageChange = (page: number) => {
		setPage(page);
	};

	const handlePageSizeChange = (pageSize: number) => {
		setPageSize(pageSize);
	};

	return (
		<div className="py-10 container mx-auto space-y-6">
			<div className="bg-gradient-to-r from-emerald-600 via-blue-700 to-slate-700 rounded-lg p-6 text-white">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold mb-2 capitalize">
							{session?.user?.rahatRole || "User"} Dashboard
						</h1>
						<h1 className="text-3xl font-bold mb-2 capitalize">
							Welcome back, {session?.user?.name || "User"}
						</h1>
						<p className="text-emerald-100 text-sm font-medium capitalize">
							Role: {session?.user?.rahatRole || "User"} • Department: Revenue
							Department
						</p>
					</div>
				</div>
			</div>

			{/* <QuestionsTableCards /> */}
			<RahatCases />
			<div className="flex justify-between">
				<h2 className="text-2xl font-bold">Pending Cases</h2>
				<div className="flex gap-2 items-center">
					{session?.user?.rahatRole === "tehsildar" && (
						<CreateCaseDialog
							onSuccess={() => {
								// Refetch pending cases after successful creation
								// The query will automatically refetch due to invalidation
							}}
						/>
					)}
				</div>
			</div>
			<RahatCasesTable
				data={pendingCasesData?.data}
				isLoading={isLoading}
				onPageChange={handlePageChange}
				onPageSizeChange={handlePageSizeChange}
			/>
		</div>
	);
}
