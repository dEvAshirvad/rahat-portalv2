"use client";

import { ReactNode } from "react";
import { useAuth } from "./auth-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface RoleGuardProps {
	children: ReactNode;
	allowedRoles?: string[];
	fallback?: ReactNode;
	redirectTo?: string;
}

export function RoleGuard({
	children,
	allowedRoles = [],
	fallback = <div>Access Denied</div>,
	redirectTo = "/",
}: RoleGuardProps) {
	const { user, isLoading } = useAuth();
	const router = useRouter();

	// Show loading while checking authentication
	if (isLoading) {
		return <div>Loading...</div>;
	}

	// Check if user has required role
	const hasAccess =
		allowedRoles.length === 0 ||
		(user && allowedRoles.includes(user.rahatRole));

	if (!hasAccess) {
		// Show toast and redirect
		toast.error("You don't have permission to access this page");
		router.push(redirectTo);
		return fallback;
	}

	return <>{children}</>;
}

// Convenience components for specific roles
export function AdminOnly({
	children,
	fallback,
	redirectTo,
}: Omit<RoleGuardProps, "allowedRoles">) {
	return (
		<RoleGuard
			allowedRoles={["admin", "collector"]}
			fallback={fallback}
			redirectTo={redirectTo}>
			{children}
		</RoleGuard>
	);
}

export function CollectorOnly({
	children,
	fallback,
	redirectTo,
}: Omit<RoleGuardProps, "allowedRoles">) {
	return (
		<RoleGuard
			allowedRoles={["collector", "admin"]}
			fallback={fallback}
			redirectTo={redirectTo}>
			{children}
		</RoleGuard>
	);
}

export function TehsildarOnly({
	children,
	fallback,
	redirectTo,
}: Omit<RoleGuardProps, "allowedRoles">) {
	return (
		<RoleGuard
			allowedRoles={["tehsildar", "collector", "admin"]}
			fallback={fallback}
			redirectTo={redirectTo}>
			{children}
		</RoleGuard>
	);
}
