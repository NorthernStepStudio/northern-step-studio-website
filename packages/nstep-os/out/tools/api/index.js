export function createHttpApiAdapter() {
    const request = async (input) => {
        const response = await fetch(input.url, {
            method: input.method || "GET",
            headers: {
                ...(input.body ? { "content-type": "application/json" } : {}),
                ...(input.headers || {}),
            },
            body: input.body === undefined ? undefined : JSON.stringify(input.body),
        });
        const text = await response.text();
        let json;
        try {
            json = text ? JSON.parse(text) : undefined;
        }
        catch {
            json = undefined;
        }
        return {
            status: response.status,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries()),
            json,
            text,
        };
    };
    return {
        request,
        getJson: (url, headers) => request({ url, method: "GET", headers }),
        postJson: (url, body, headers) => request({ url, method: "POST", body, headers }),
    };
}
//# sourceMappingURL=index.js.map