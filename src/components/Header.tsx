"use client";

import { useSession, useSignOut } from "@/queries/auth";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default function Header() {
	const { data: session, isFetching } = useSession();
	const signOutMutation = useSignOut();

	const handleSignOut = () => {
		signOutMutation.mutate();
	};

	return (
		<>
			{/* Header */}
			<header className="bg-gradient-to-r from-orange-500 via-white to-green-600 shadow-lg border-b-4 border-amber-500 relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-orange-500/90 via-white/95 to-green-600/90"></div>
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-blue-100/50"></div>

				<div className="container mx-auto h-24 flex items-center w-full px-6 py-4 relative z-10">
					<div className="flex items-center justify-between w-full">
						{/* Logos and Title */}
						<div className="flex items-center space-x-4">
							<div>
								<h1 className="text-2xl font-bold text-blue-900 drop-shadow-md">
									प्रोजेक्ट राहत
								</h1>
								<p className="text-sm text-red-700 font-medium drop-shadow-sm">
									PROJECT RAHAT | District Administration Raipur
								</p>
							</div>
						</div>

						{isFetching ||
							(session?.user && (
								<div className="flex items-center space-x-4">
									<nav className="flex items-center space-x-4 text-sm text-blue-900 font-medium drop-shadow-sm">
										<Link href="/">Home</Link>
										{session.user.rahatRole === "tehsildar" && (
											<Link href="/ready-to-close">Ready to Close</Link>
										)}
										{session.user.role === "admin" && (
											<>
												<Link href="/overview">Overview</Link>
												<Link href="/cases">Cases</Link>
												<Link href="/admin">Admin</Link>
											</>
										)}
									</nav>

									<Button variant="outline" onClick={handleSignOut}>
										{signOutMutation.isPending ? "Logging out..." : "Logout"}
									</Button>
								</div>
							))}
					</div>
				</div>
			</header>
		</>
	);
}
