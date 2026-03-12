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
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Reset password</CardTitle>
                <CardDescription>
                    Enter your email and we&apos;ll send you a reset link.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 rounded-md border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 rounded-md border border-emerald-800 bg-emerald-950 px-3 py-2 text-sm text-emerald-300">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            {success}
                        </div>
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
                        className="w-full"
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
                    className="text-[var(--primary)] hover:underline"
                >
                    Back to sign in
                </Link>
            </CardFooter>
        </Card>
    );
}
