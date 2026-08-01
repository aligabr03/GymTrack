"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { updatePassword } from "@/actions/auth";
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

export default function UpdatePasswordPage() {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [checking, setChecking] = useState(true);
    const [hasSession, setHasSession] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data: { session } }) => {
            setHasSession(!!session);
            setChecking(false);
        });
    }, []);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await updatePassword(formData);
            if (result?.error) setError(result.error);
        });
    }

    if (checking) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Update password</CardTitle>
                    <CardDescription>Verifying your session…</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
                </CardContent>
            </Card>
        );
    }

    if (!hasSession) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Invalid link</CardTitle>
                    <CardDescription>
                        This password reset link is invalid or has expired. Please request a new one.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="justify-center text-sm text-[var(--muted-foreground)]">
                    <Link
                        href="/auth/reset-password"
                        className="text-[var(--foreground)] hover:underline"
                    >
                        Request new reset link
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Update password</CardTitle>
                <CardDescription>
                    Enter your new password below.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="password">New password</Label>
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
                        className="w-full"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Updating…
                            </>
                        ) : (
                            "Update password"
                        )}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="justify-center text-sm text-[var(--muted-foreground)]">
                <Link
                    href="/auth/login"
                    className="text-[var(--foreground)] hover:underline"
                >
                    Back to sign in
                </Link>
            </CardFooter>
        </Card>
    );
}
