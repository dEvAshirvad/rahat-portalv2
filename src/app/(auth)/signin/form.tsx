"use client";

import { EyeIcon, EyeOffIcon, GalleryVerticalEnd, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useSignIn } from "@/queries/auth";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState, useRef } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

const formSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	rememberMe: z.boolean(),
});

const errorCodeMap = [
	{
		code: "INVALID_EMAIL_OR_PASSWORD",
		title: "Invalid email or password",
		description: "Please check your email and password and try again.",
	},
	{
		code: "INVALID_CREDENTIALS",
		title: "Invalid credentials",
		description: "Please check your email and password and try again.",
	},
	{
		code: "INTERNAL_SERVER_ERROR",
		title: "Internal server error",
		description: "Please try again later.",
	},
];

export default function SigninForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [count, setCount] = useState<number | null>(null);
	const countRef = useRef<number>(0);
	const [showAlert, setShowAlert] = useState<{
		title: string;
		description: string;
	} | null>(null);
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
			rememberMe: true,
		},
	});
	const signInMutation = useSignIn();

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		try {
			const response = await signInMutation.mutateAsync({
				...data,
			});

			setShowAlert({
				title: "Login successful",
				description: "You are now logged in.",
			});
		} catch (error) {
			if (error instanceof AxiosError) {
				console.log(error.response?.data);
				const errorCode = error.response?.data.code;
				const errorData = errorCodeMap.find((item) => item.code === errorCode);
				if (errorData) {
					setShowAlert({
						title: errorData.title,
						description: errorData.description,
					});
				} else {
					setShowAlert({
						title: "Internal server error",
						description: "Please try again later.",
					});
				}
			}
		}
	};

	useEffect(() => {
		if (signInMutation.isSuccess) {
			// redirect to dashboard after 3 seconds count it back
			countRef.current = 3;
			setCount(3);

			const interval = setInterval(() => {
				countRef.current -= 1;
				setCount(countRef.current);

				if (countRef.current <= 0) {
					clearInterval(interval);
					// Use setTimeout to avoid the setState during render issue
					setTimeout(() => {
						router.push("/");
					}, 0);
				}
			}, 1000);

			return () => clearInterval(interval);
		}
	}, [signInMutation.isSuccess, router]);

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<div className="flex flex-col gap-6">
				<div className="flex flex-col items-center gap-2">
					<a href="#" className="flex flex-col items-center gap-2 font-medium">
						<div className="flex size-8 items-center justify-center rounded-md">
							<GalleryVerticalEnd className="size-6" />
						</div>
						<span className="sr-only">Project Rahat</span>
					</a>
					<h1 className="text-xl font-bold">Welcome to Project Rahat</h1>
					<div className="text-center text-sm">
						Don&apos;t have an account?{" "}
						<a href="#" className="underline underline-offset-4">
							Contact Admin
						</a>
					</div>
				</div>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div className="flex flex-col gap-6">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input {...field} placeholder="m@example.com" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													{...field}
													placeholder="password"
													type={showPassword ? "text" : "password"}
												/>
												<div
													onClick={() => setShowPassword(!showPassword)}
													className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
													{showPassword ? (
														<EyeIcon className="size-4" />
													) : (
														<EyeOffIcon className="size-4" />
													)}
												</div>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="rememberMe"
								render={({ field }) => (
									<FormItem>
										<div className="flex gap-2 items-center">
											<FormControl>
												<Checkbox
													onCheckedChange={(checked) =>
														field.onChange(!!checked)
													}
													checked={field.value}
													className="data-[state=checked]:bg-primary"
												/>
											</FormControl>
											<FormLabel>Remember Me</FormLabel>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button
								type="submit"
								className="w-full"
								disabled={signInMutation.isPending || !form.formState.isValid}>
								Login
							</Button>
						</div>
					</form>
				</Form>
			</div>

			<AlertDialog
				open={!!showAlert}
				onOpenChange={(open) => {
					if (!open) {
						setShowAlert(null);
					}
				}}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{showAlert?.title}</AlertDialogTitle>
						<AlertDialogDescription>
							{showAlert?.description}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction>
							{signInMutation.isSuccess ? (
								<span
									onClick={() => {
										router.push("/");
									}}>
									Logging in {count}
								</span>
							) : (
								"Continue"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<div className="text-center">
				<p className="text-xs text-muted-foreground">
					© 2025 Government of India. All rights reserved. Developed by <br />
					<a href="https://www.google.com" className="underline">
						NIT Raipur
					</a>
				</p>
			</div>
		</div>
	);
}
