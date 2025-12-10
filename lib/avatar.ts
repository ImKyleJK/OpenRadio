import md5 from "md5"

const PLACEHOLDER = "/placeholder.svg"

interface AvatarSource {
  avatar?: string | null
  email?: string | null
}

export function getGravatarUrl(email?: string | null, size = 128) {
  if (!email) return PLACEHOLDER
  const hash = md5(email.trim().toLowerCase())
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`
}

export function resolveAvatar(source?: AvatarSource | null, size = 128) {
  if (!source) return PLACEHOLDER
  const custom = typeof source.avatar === "string" ? source.avatar.trim() : ""
  if (custom) return custom
  return getGravatarUrl(source.email, size)
}
