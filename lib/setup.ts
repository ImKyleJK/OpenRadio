const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_STATION_NAME",
  "NEXT_PUBLIC_STATION_LOGO",
  "NEXT_PUBLIC_STREAM_URL",
  "NEXT_PUBLIC_AZURACAST_API_URL",
  "MONGODB_URI",
  "JWT_SECRET",
]

export function hasRequiredEnv() {
  return REQUIRED_ENV_VARS.every((key) => {
    const value = process.env[key]
    return typeof value === "string" && value.length > 0
  })
}

export function isSetupComplete() {
  if (process.env.SETUP_COMPLETED === "true") {
    return true
  }
  return hasRequiredEnv()
}

export function getSetupStatus() {
  return {
    isLocked: isSetupComplete(),
    required: REQUIRED_ENV_VARS,
  }
}
