"use client";

import {
	createContext,
	useContext,
	ReactNode,
	useEffect,
	useMemo,
} from "react";
import { useSession, Session, User } from "@/queries/auth";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

interface AuthContextType {
	user: User | null;
	session: Session | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: Error | null;
	canAccessPage: (path: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define role-based access control
const ROLE_ACCESS = {
	// Collector can access specific pages
	collector: [
		"/",
		"/overview",
		"/cases",
		"/admin",
		"/cases/[id]",
		"/cases/[id]/close",
	],

	// Tehsildar can access specific pages
	tehsildar: ["/", "/ready-to-close", "/cases/[id]", "/cases/[id]/close"],

	// Default fallback
	default: ["/", "/cases/[id]"],
};

// Helper function to check if a path matches a pattern
const pathMatches = (path: string, pattern: string): boolean => {
	if (pattern === path) return true;
	if (pattern.includes("[id]")) {
		// Convert pattern to regex for dynamic routes
		const regexPattern = pattern.replace(/\[id\]/g, "[^/]+");
		const regex = new RegExp(`^${regexPattern}$`);
		return regex.test(path);
	}
	return false;
};

export function Authenticated({ children }: { children: ReactNode }) {
	const { data, isLoading, error, isFetched } = useSession();
	const router = useRouter();
	const pathname = usePathname();

	const canAccessPage = useMemo(() => {
		return (path: string): boolean => {
			if (!data?.user?.rahatRole) return false;

			const userRole = data.user.rahatRole;
			const allowedPaths =
				ROLE_ACCESS[userRole as keyof typeof ROLE_ACCESS] ||
				ROLE_ACCESS.default;

			return allowedPaths.some((pattern) => pathMatches(path, pattern));
		};
	}, [data?.user?.rahatRole]);

	const value: AuthContextType = useMemo(() => {
		return {
			user: data?.user || null,
			session: data?.session || null,
			isAuthenticated: !!data?.session,
			isLoading,
			error: error as Error | null,
			canAccessPage,
		};
	}, [data, isLoading, error, canAccessPage]);

	// Handle authentication check in useEffect to avoid setState during render
	useEffect(() => {
		if (!isLoading && !data?.session && isFetched) {
			toast.error("You are not authenticated");
			router.push("/signin");
		}
	}, [isLoading, data?.session, router, isFetched]);

	// Handle role-based access control
	useEffect(() => {
		if (data?.session && pathname && !isLoading) {
			const hasAccess = canAccessPage(pathname);
			if (!hasAccess) {
				toast.error("You don't have permission to access this page");
				router.push("/");
			}
		}
	}, [data?.session, pathname, canAccessPage, isLoading, router]);

	// Don't render children if not authenticated (navigation will happen in useEffect)
	if (!data?.session) {
		return <div>Loading...</div>;
	}

	// Show loading state while checking authentication
	if (isLoading) {
		return <div>Loading...</div>;
	}

	// Check if user has access to current page
	if (pathname && !canAccessPage(pathname)) {
		return <div>Checking permissions...</div>;
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
