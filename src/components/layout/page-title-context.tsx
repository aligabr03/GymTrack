"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";

const PageTitleContext = createContext<{
    title: string | null;
    subtitle: string | null;
    setTitle: (t: string | null, s?: string | null) => void;
}>({ title: null, subtitle: null, setTitle: () => {} });

export function PageTitleProvider({ children }: { children: ReactNode }) {
    const [title, setTitle] = useState<string | null>(null);
    const [subtitle, setSubtitle] = useState<string | null>(null);
    const set = useCallback((t: string | null, s?: string | null) => {
        setTitle(t);
        if (s !== undefined) setSubtitle(s);
    }, []);
    return (
        <PageTitleContext.Provider value={{ title, subtitle, setTitle: set }}>
            {children}
        </PageTitleContext.Provider>
    );
}

export function usePageTitle() {
    return useContext(PageTitleContext);
}

/** Drop this into any server-rendered page to override the mobile header title. */
export function SetPageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
    const { setTitle } = useContext(PageTitleContext);
    useEffect(() => {
        setTitle(title, subtitle ?? null);
        return () => setTitle(null, null);
    }, [title, subtitle, setTitle]);
    return null;
}
