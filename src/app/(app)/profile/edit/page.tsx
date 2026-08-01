"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMyProfile, updateProfile } from "@/actions/social";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportDataButton } from "@/components/profile/export-data-button";
import { AlertCircle } from "lucide-react";

export default function EditProfilePage() {
    const router = useRouter();
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [weightUnit, setWeightUnit] = useState<"KG" | "LBS">("KG");
    const [bodyWeightUnit, setBodyWeightUnit] = useState<"KG" | "LBS">("KG");
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getMyProfile().then((p) => {
            if (p) {
                setDisplayName(p.displayName);
                setBio(p.bio ?? "");
                setWeightUnit((p.weightUnit as "KG" | "LBS") ?? "KG");
                setBodyWeightUnit((p.bodyWeightUnit as "KG" | "LBS") ?? "KG");
                setUserId(p.userId);
            }
            setLoading(false);
        });
    }, []);

    async function handleSave() {
        setSaving(true);
        setError(null);
        try {
            const result = await updateProfile({ displayName: displayName.trim(), bio: bio.trim() || undefined, weightUnit, bodyWeightUnit });
            if ("error" in result && result.error) {
                setError(result.error);
                return;
            }
            if (userId) router.push(`/profile/${userId}`);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="max-w-lg space-y-4">
                <div className="h-8 w-48 bg-[var(--secondary)] rounded animate-pulse" />
                <div className="h-40 bg-[var(--secondary)] rounded-xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="max-w-lg space-y-6">
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Your info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Display Name</Label>
                        <Input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Bio</Label>
                        <Textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="A short bio (optional)"
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Weight unit (workouts)</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={weightUnit === "KG" ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => setWeightUnit("KG")}
                            >
                                kg
                            </Button>
                            <Button
                                type="button"
                                variant={weightUnit === "LBS" ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => setWeightUnit("LBS")}
                            >
                                lbs
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Weight unit (body metrics)</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={bodyWeightUnit === "KG" ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => setBodyWeightUnit("KG")}
                            >
                                kg
                            </Button>
                            <Button
                                type="button"
                                variant={bodyWeightUnit === "LBS" ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => setBodyWeightUnit("LBS")}
                            >
                                lbs
                            </Button>
                        </div>
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}
                    <Button
                        onClick={handleSave}
                        disabled={saving || !displayName.trim()}
                        className="w-full"
                    >
                        {saving ? "Saving…" : "Save"}
                    </Button>
                </CardContent>
            </Card>

            {/* Desktop-only data export */}
            <div className="hidden md:block">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Data export</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-[var(--muted-foreground)] mb-4">
                            Download all your GymTrack data as a JSON file, including workouts, body metrics, personal records, and templates.
                        </p>
                        <ExportDataButton />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
