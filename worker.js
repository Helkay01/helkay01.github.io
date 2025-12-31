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

async function uaData() {
    if (!navigator.userAgentData) return null;
    const hi = await navigator.userAgentData.getHighEntropyValues([
        "architecture","bitness","model","platform",
        "platformVersion","uaFullVersion","fullVersionList","wow64"
    ]);
    return {
        mobile: navigator.userAgentData.mobile,
        brands: navigator.userAgentData.brands,
        ...hi
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
        uaData: await uaData(),
        canvas: "no-dom",
        webgl: await sha256(webglFP())
    });
};
