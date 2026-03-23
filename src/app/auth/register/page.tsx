"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { register } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await register(formData);
            if (result?.error) setError(result.error);
        });
    }

    return (
        <Card className="border-[var(--border)] bg-[var(--card)] shadow-2xl shadow-black/20">
            <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold">Create account</CardTitle>
                <CardDescription className="text-[var(--muted-foreground)]">
                    Start tracking your gym progression today
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive" className="border-red-800/50 bg-red-950/50">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-red-300">{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Your name"
                            autoComplete="name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Min. 8 characters"
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 font-semibold shadow-[0_0_12px_var(--primary-glow)] h-10"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creating account…
                            </>
                        ) : (
                            "Create account"
                        )}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="justify-center text-sm text-[var(--muted-foreground)]">
                Already have an account?{" "}
                <Link
                    href="/auth/login"
                    className="ml-1 text-[var(--foreground)] hover:underline"
                >
                    Sign in
                </Link>
            </CardFooter>
        </Card>
    );
}
