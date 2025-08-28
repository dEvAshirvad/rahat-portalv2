import Header from "@/components/Header";
import React from "react";

function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-svh flex flex-col">
			<Header />
			<div className="bg-background flex md:pt-28 pt-20 flex-col items-center justify-center gap-6 p-6">
				<div className="w-full max-w-sm">{children}</div>
			</div>
		</div>
	);
}

export default AuthLayout;
