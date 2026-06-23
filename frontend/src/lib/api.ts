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
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || "An error occurred");
        }

        return response.json();
    },

    get(endpoint: string) {
        return this.request(endpoint, { method: "GET" });
    },

    post(endpoint: string, body: any) {
        const isUrlEncoded = body instanceof URLSearchParams;
        const isMultipart = typeof window !== "undefined" && body instanceof FormData;

        const options: RequestInit = {
            method: "POST",
            // decide how to format the body based on what is being sent
            body: isMultipart ? body : (isUrlEncoded ? body : JSON.stringify(body)),
        };

        // set the headers accordingly
        if (isUrlEncoded) {
            options.headers = { "Content-Type": "application/x-www-form-urlencoded" };
        } else if (isMultipart) {
            // CRITICAL: Leave headers empty for multipart form data.
            // the browser will automatically set 'Content-Type: multipart/form-data; boundary=---...'
            options.headers = {};
        }

        return this.request(endpoint, options);
    }

}