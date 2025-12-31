async function sha256(str) {
    const buf = new TextEncoder().encode(str);
    const d = await crypto.subtle.digest("SHA-256", buf);
    return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,"0")).join("");
}

function webglFP() {
    const c = new OffscreenCanvas(64,64);
    const gl = c.getContext("webgl");
    if (!gl) return "none";
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    return dbg
        ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) +
          gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)
        : "masked";
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

    const norm = v =>
        v === undefined || v === null || v === "" ? "—" : v;

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

onmessage = async () => {
    postMessage({
        env: "Worker",
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
        webgl: await sha256(webglFP())
    });
};
