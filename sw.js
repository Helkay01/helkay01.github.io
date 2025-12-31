self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => self.clients.claim());

function webglInfo() {
    const c = new OffscreenCanvas(64,64);
    const gl = c.getContext("webgl");
    if (!gl) return { vendor: "none", renderer: "none" };

    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    return dbg ? {
        vendor: gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL),
        renderer: gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)
    } : {
        vendor: "masked",
        renderer: "masked"
    };
}

async function collectUAData() {
    const uad = navigator.userAgentData;
    if (!uad) return { status: "userAgentData not supported" };

    let hi = {};
    try {
        hi = await uad.getHighEntropyValues([
            "architecture","bitness","model","platform",
            "platformVersion","uaFullVersion","fullVersionList","wow64"
        ]);
    } catch {}

    const norm = v => v ?? "—";

    return {
        mobile: norm(uad.mobile),
        brands: (uad.brands || []).map(b=>`${b.brand} ${b.version}`).join(", ") || "—",
        architecture: norm(hi.architecture),
        bitness: norm(hi.bitness),
        model: norm(hi.model),
        platform: norm(hi.platform),
        platformVersion: norm(hi.platformVersion),
        uaFullVersion: norm(hi.uaFullVersion),
        fullVersionList: Array.isArray(hi.fullVersionList)
            ? hi.fullVersionList.map(b=>`${b.brand} ${b.version}`).join(", ")
            : "—",
        wow64: norm(hi.wow64)
    };
}

self.addEventListener("message", async e => {
    const gl = webglInfo();
    const data = {
        env: "ServiceWorker",
        ua: navigator.userAgent,
        platform: navigator.platform,
        languages: navigator.languages?.join(","),
        mem: navigator.deviceMemory ?? "undef",
        cores: navigator.hardwareConcurrency,
        touch: navigator.maxTouchPoints,
        webdriver: navigator.webdriver,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        uaData: await collectUAData(),
        canvas: "no-dom",
        webgl_vendor: gl.vendor,
        webgl_renderer: gl.renderer
    };

    const client = await self.clients.get(e.source.id);
    client?.postMessage(data);
});
