"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportUserData } from "@/actions/export";

export function ExportDataButton() {
    const [loading, setLoading] = useState(false);

    async function handleExport() {
        setLoading(true);
        try {
            const data = await exportUserData();
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `gymtrack-export-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button
            variant="outline"
            onClick={handleExport}
            disabled={loading}
            className="w-full"
        >
            <Download className="h-4 w-4 mr-2" />
            {loading ? "Exporting…" : "Export all data"}
        </Button>
    );
}
