"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteWorkout } from "@/actions/workouts";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteWorkoutButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    function handleDelete() {
        if (!confirm("Delete this workout? This cannot be undone.")) return;
        startTransition(async () => {
            const result = await deleteWorkout(id);
            if (!result.success) {
                toast({
                    title: result.error ?? "Delete failed",
                    variant: "destructive",
                });
                return;
            }
            toast({ title: "Workout deleted" });
            router.push("/workouts");
        });
    }

    return (
        <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
            Delete
        </Button>
    );
}
