"use client";

import * as React from "react";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 4000;

type ToastVariant = "default" | "destructive" | "success";

type ToasterToast = {
    id: string;
    title?: string;
    description?: string;
    variant?: ToastVariant;
    duration?: number;
};

type State = {
    toasts: ToasterToast[];
};

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: {
    type: "ADD_TOAST" | "REMOVE_TOAST";
    toast?: ToasterToast;
    toastId?: string;
}) {
    switch (action.type) {
        case "ADD_TOAST":
            memoryState = {
                toasts: [action.toast!, ...memoryState.toasts].slice(
                    0,
                    TOAST_LIMIT,
                ),
            };
            break;
        case "REMOVE_TOAST":
            memoryState = {
                toasts: memoryState.toasts.filter(
                    (t) => t.id !== action.toastId,
                ),
            };
            break;
    }
    listeners.forEach((listener) => listener(memoryState));
}

function toast(props: Omit<ToasterToast, "id">) {
    const id = Math.random().toString(36).slice(2);
    dispatch({ type: "ADD_TOAST", toast: { ...props, id } });
    setTimeout(
        () => dispatch({ type: "REMOVE_TOAST", toastId: id }),
        props.duration ?? TOAST_REMOVE_DELAY,
    );
    return id;
}

function useToast() {
    const [state, setState] = React.useState<State>(memoryState);

    React.useEffect(() => {
        listeners.push(setState);
        return () => {
            const index = listeners.indexOf(setState);
            if (index > -1) listeners.splice(index, 1);
        };
    }, []);

    return { toasts: state.toasts, toast };
}

export { useToast, toast };
