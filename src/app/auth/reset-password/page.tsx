"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { resetPassword } from "@/actions/auth";
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
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ResetPasswordPage() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await resetPassword(formData);
            if ("error" in result && result.error) setError(result.error);
            if ("message" in result && result.message)
                setSuccess(result.message);
        });
    }

    return (
        <Card className="border-[var(--border)] bg-[var(--card)] shadow-2xl shadow-black/20">
            <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
                <CardDescription className="text-[var(--muted-foreground)]">
                    Enter your email and we&apos;ll send you a reset link.
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

                    {success && (
                        <Alert className="border-[var(--primary)]/30 bg-[var(--primary)]/10">
                            <CheckCircle2 className="h-4 w-4 text-[var(--primary)]" />
                            <AlertDescription className="text-[var(--primary)]">{success}</AlertDescription>
                        </Alert>
                    )}

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

                    <Button
                        type="submit"
                        className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 font-semibold shadow-[0_0_12px_var(--primary-glow)] h-10"
                        disabled={isPending || !!success}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Sending…
                            </>
                        ) : (
                            "Send reset link"
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
