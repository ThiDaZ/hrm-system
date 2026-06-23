const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {
    async request(endpoint: string, options: RequestInit) {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }

        if (token){
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            const errorDate = await response.json().catch(() => ({}));
            throw new Error(errorDate);
        }

        return response.json();
    },

    get(endpoint: string) {
        return this.request(endpoint, { method: "GET" });
    },
    post(endpoint: string, body: any) {
        // special handling for FastAPI's OAuth2 login which requires FormData
        const isFormData = body instanceof URLSearchParams;

        const options: RequestInit = {
            method: "POST",
            body: isFormData ? body : JSON.stringify(body),
            headers: isFormData
                ? { "Content-Type": "application/x-www-form-urlencoded" }
                : {},
        };

        return this.request(endpoint, options);
    }

}