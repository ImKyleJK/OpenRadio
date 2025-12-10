const allowedCharsRegex = /[^a-z\s_-]/g

export function usernameFromDisplayName(displayName: string) {
  const sanitized = displayName
    .toLowerCase()
    .replace(allowedCharsRegex, "")
    .replace(/\s+/g, "_")
    .replace(/-{2,}/g, "-")
    .replace(/_{2,}/g, "_")
    .replace(/^[-_]+|[-_]+$/g, "")
  return sanitized || "user"
}
