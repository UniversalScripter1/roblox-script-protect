export const config = {
  matcher: '/api/script',     // without .lua now, or '/protected/script.lua' if static
};
export default function middleware(request) {
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Very simple check – most Roblox executors send special UA
  // You can make this MUCH stricter (add more patterns, check headers, etc.)
  const isExecutor =
    userAgent.includes("Synapse") ||
    userAgent.includes("Script-Ware") ||
    userAgent.includes("KRNL") ||
    userAgent.includes("Fluxus") ||
    userAgent.includes("Arceus") ||
    userAgent.includes("Delta") ||
    userAgent.includes("Electron") ||           // many use electron
    userAgent.includes("RobloxExecutor") ||
    userAgent.length < 50;                      // most browser UAs are long

  if (isExecutor) {
    // Let it pass → serve the real script
    return NextResponse.next();
  }

  // Browser / curl / etc → log + deny

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (webhookUrl) {
    const info = {
      content: null,
      embeds: [{
        title: "Script Leak Attempt !",
        color: 0xff0000,
        fields: [
          { name: "IP", value: request.headers.get("x-forwarded-for") || "hidden", inline: true },
          { name: "User-Agent", value: "```" + userAgent.substring(0, 500) + "```", inline: false },
          { name: "Time", value: new Date().toISOString(), inline: true },
          { name: "URL", value: request.url, inline: false }
        ],
        footer: { text: "Vercel Protected Script" }
      }]
    };

    // Fire and forget (no await – edge runtime)
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info)
    }).catch(() => {}); // silent fail
  }

  // Return denied page
  return new Response(
    deniedHtmlContent,
    {
      status: 403,
      headers: { "Content-Type": "text/html" }
    }
  );
}

// You can also put this in public/denied.html and fetch it, but embedding is faster on edge
const deniedHtmlContent = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>ACCESS DENIED</title><style>body{background:#000;color:#ff0044;font-family:Arial;text-align:center;padding-top:15%;}h1{font-size:4rem;margin:0;}p{font-size:1.4rem;}</style></head><body><h1>ACCESS DENIED</h1><p>This resource is protected. Only Roblox executors can access it.</p></body></html>`;
