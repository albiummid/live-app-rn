import { signal } from "@preact/signals-react";

export const authState = signal({
    isLoading: false,
    isAuthenticated: false,
    device_token: "0d48cf71-5be1-42cd-bb6f-8d25f53ea59b",
    session_token: "",
    user_id: "",
    user_info: null,
});
