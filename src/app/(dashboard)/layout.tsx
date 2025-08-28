import Header from "@/components/Header";
import React from "react";

function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-svh flex flex-col bg-accent">
			<Header />
			<div className="flex-1">
				<div className="max-w-5xl mx-auto">{children}</div>
			</div>
		</div>
	);
}

export default DashboardLayout;
