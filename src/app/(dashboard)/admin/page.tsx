"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Activity } from "lucide-react";
import UserManagement from "@/components/Admin/UserManagement";
import SessionManagement from "@/components/Admin/SessionManagement";
import { AdminOnly } from "@/components/role-guard";

export default function AdminPage() {
	return (
		<AdminOnly>
			<div className="py-10 container mx-auto space-y-6">
				<div className="bg-gradient-to-r from-emerald-600 via-blue-700 to-slate-700 rounded-lg p-6 text-white">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold mb-2 capitalize">
								Admin Dashboard
							</h1>
							<h1 className="text-3xl font-bold mb-2 capitalize">
								Welcome back, Admin
							</h1>
							<p className="text-emerald-100 text-sm font-medium capitalize">
								Role: Admin • Department: Revenue Department
							</p>
						</div>
					</div>
				</div>
				<Tabs defaultValue="users" className="space-y-6">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger
							value="users"
							className="flex col-span-2 items-center h-10 gap-2">
							<Users className="size-4" />
							Users
						</TabsTrigger>
						<TabsTrigger
							value="sessions"
							className="flex items-center h-10 col-span-2 gap-2">
							<Activity className="size-4" />
							Sessions
						</TabsTrigger>
					</TabsList>

					<TabsContent value="users" className="space-y-6">
						<UserManagement />
					</TabsContent>

					<TabsContent value="sessions" className="space-y-6">
						<SessionManagement />
					</TabsContent>
				</Tabs>
			</div>
		</AdminOnly>
	);
}
