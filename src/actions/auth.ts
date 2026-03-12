"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
});

export async function login(formData: FormData) {
    const supabase = await createClient();

    const parsed = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return { error: error.message };

    redirect("/dashboard");
}

export async function register(formData: FormData) {
    const supabase = await createClient();

    const parsed = registerSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
        name: formData.get("name"),
    });

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
            data: { name: parsed.data.name },
        },
    });

    if (error) return { error: error.message };

    return {
        success: true,
        message: "Check your email to confirm your account.",
    };
}

export async function resetPassword(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get("email") as string;

    if (!email || !z.string().email().safeParse(email).success) {
        return { error: "Please enter a valid email address." };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/update-password`,
    });

    if (error) return { error: error.message };

    return { success: true, message: "Password reset email sent." };
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/auth/login");
}
