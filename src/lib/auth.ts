import { createClient } from "@/lib/supabase/server";

export async function getUserId(): Promise<string> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    return user.id;
}

export async function getUserMeta(): Promise<{ id: string; name: string }> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const name =
        (user.user_metadata?.name as string | undefined) ??
        user.email?.split("@")[0] ??
        "Athlete";
    return { id: user.id, name };
}
