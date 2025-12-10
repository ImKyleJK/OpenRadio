const fallback = {
  name: "Community Radio",
  tagline: "Your community radio station",
  description: "Streaming live 24/7 with the best music and local shows.",
  logo: "",
  primaryColor: "#22d3ee",
  streamUrl: "https://stream.example.com/radio",
}

export const stationConfig = {
  name: process.env.NEXT_PUBLIC_STATION_NAME?.trim() || fallback.name,
  tagline: process.env.NEXT_PUBLIC_STATION_TAGLINE?.trim() || fallback.tagline,
  description: process.env.NEXT_PUBLIC_STATION_DESCRIPTION?.trim() || fallback.description,
  logo: process.env.NEXT_PUBLIC_STATION_LOGO?.trim() || fallback.logo,
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR?.trim() || fallback.primaryColor,
  streamUrl: process.env.NEXT_PUBLIC_STREAM_URL?.trim() || fallback.streamUrl,
  azuracastApiUrl: process.env.NEXT_PUBLIC_AZURACAST_API_URL?.trim() || "",
}

export const stationThemeVars: Record<string, string> = {
  "--primary": stationConfig.primaryColor,
  "--accent": stationConfig.primaryColor,
  "--ring": stationConfig.primaryColor,
  "--chart-1": stationConfig.primaryColor,
  "--sidebar-primary": stationConfig.primaryColor,
  "--sidebar-ring": stationConfig.primaryColor,
}
