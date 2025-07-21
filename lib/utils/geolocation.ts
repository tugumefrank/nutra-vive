// You might create a utility function for this
async function getGeolocation(
  ip: string
): Promise<{ country?: string; city?: string }> {
  try {
    if (ip === "unknown" || ip === "127.0.0.1" || ip.startsWith("192.168.")) {
      return {}; // Skip geolocation for local or unknown IPs
    }
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();

    if (data.status === "success") {
      return {
        country: data.country,
        city: data.city,
      };
    }
  } catch (error) {
    console.error("Error fetching geolocation:", error);
  }
  return {};
}
