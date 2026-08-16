import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next's dev server blocks cross-origin requests to dev assets by default —
  // needed so the app is actually usable from a phone on the same WiFi during
  // `next dev` (not just localhost). If your computer's LAN IP changes (new
  // network, DHCP renewal), add the new one here too.
  allowedDevOrigins: ["172.16.109.104"],
};

export default nextConfig;
