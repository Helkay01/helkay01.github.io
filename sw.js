self.addEventListener("message", async e => {
    async function sha(str) {
        const buf = new TextEncoder().encode(str);
        const d = await crypto.subtle.digest("SHA-256", buf);
        return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,"0")).join("");
    }

    let webgl = "none";
    try {
        const c = new OffscreenCanvas(64,64);
        const gl = c.getContext("webgl");
        if (gl) {
            const dbg = gl.getExtension("WEBGL_debug_renderer_info");
            webgl = dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : "masked";
        }
    } catch {}

    e.source.postMessage({
        env: "ServiceWorker",
        ua: navigator.userAgent,
        platform: navigator.platform,
        languages: navigator.languages?.join(","),
        mem: navigator.deviceMemory ?? "undef",
        cores: navigator.hardwareConcurrency,
        touch: navigator.maxTouchPoints,
        webdriver: navigator.webdriver,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        canvas: "no-dom",
        webgl: await sha(webgl)
    });
});
