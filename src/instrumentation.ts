export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getDefaultAutoSelectFamilyAttemptTimeout, setDefaultAutoSelectFamilyAttemptTimeout } = await import("node:net");
    // Cross-region TCP handshakes can exceed Node's short address-family
    // attempt window. Allow IPv4 time to connect before trying IPv6, which
    // may be unavailable locally. Keep both families and the provider's
    // overall request deadline enabled; preserve longer operator settings.
    setDefaultAutoSelectFamilyAttemptTimeout(Math.max(2000, getDefaultAutoSelectFamilyAttemptTimeout()));
  }
}
