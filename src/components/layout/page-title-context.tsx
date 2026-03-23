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
    setTitle: (t: string | null) => void;
}>({ title: null, setTitle: () => {} });

export function PageTitleProvider({ children }: { children: ReactNode }) {
    const [title, setTitle] = useState<string | null>(null);
    return (
        <PageTitleContext.Provider value={{ title, setTitle }}>
            {children}
        </PageTitleContext.Provider>
    );
}

export function usePageTitle() {
    return useContext(PageTitleContext);
}

/** Drop this into any server-rendered page to override the mobile header title. */
export function SetPageTitle({ title }: { title: string }) {
    const { setTitle } = useContext(PageTitleContext);
    // Reset on unmount so navigating away doesn't leave a stale title.
    const stableSet = useCallback(setTitle, []); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        stableSet(title);
        return () => stableSet(null);
    }, [title, stableSet]);
    return null;
}
