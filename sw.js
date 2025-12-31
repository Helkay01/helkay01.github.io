self.addEventListener("message", async event => {
    if (event.data !== "collect") return;

    async function getWebGLInfo() {
        try {
            const canvas = new OffscreenCanvas(256, 256);
            const gl = canvas.getContext("webgl");
            if (!gl) return { vendor: "unavailable", renderer: "unavailable" };

            const dbg = gl.getExtension("WEBGL_debug_renderer_info");
            if (!dbg) return { vendor: "masked", renderer: "masked" };

            return {
                vendor: gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL),
                renderer: gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)
            };
        } catch {
            return { vendor: "error", renderer: "error" };
        }
    }

    const webgl = await getWebGLInfo();

    event.source.postMessage({
        ua: navigator.userAgent,
        platform: navigator.platform,
        languages: navigator.languages?.join(","),
        mem: navigator.deviceMemory ?? "undef",
        cores: navigator.hardwareConcurrency ?? "undef",
        touch: navigator.maxTouchPoints,
        webdriver: navigator.webdriver,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        webgl_vendor: webgl.vendor,
        webgl_renderer: webgl.renderer
    });
});
