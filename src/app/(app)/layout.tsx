import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/layout/app-nav";
import { PageTitleProvider } from "@/components/layout/page-title-context";
import { Suspense } from "react";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    return (
        <PageTitleProvider>
            <div className="min-h-dvh flex flex-col">
                <AppNav user={user} />
                <main
                    tabIndex={-1}
                    className="flex-1 min-w-0 pt-[calc(env(safe-area-inset-top)+3.5rem)] md:pt-[calc(4rem+1px)] pb-24 md:pb-0 outline-none"
                >
                    <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8">
                        <Suspense>{children}</Suspense>
                    </div>
                </main>
            </div>
        </PageTitleProvider>
    );
}
