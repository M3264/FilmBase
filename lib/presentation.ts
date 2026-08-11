const SMALL_WORDS = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "of", "on", "or", "the", "to", "vs", "with"])

export function displayTitle(value: string): string {
  const title = value.replace(/\s+/g, " ").trim()
  if (!title || !isMostlyUppercase(title)) return title

  return title
    .toLocaleLowerCase()
    .split(" ")
    .map((word, index, words) => {
      if (/^(s\d+|e\d+|s\d+e\d+)$/i.test(word)) return word.toUpperCase()
      if (/^(tv|ii|iii|iv|vi|vii|viii|ix|x)$/i.test(word)) return word.toUpperCase()
      const clean = word.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, "").toLowerCase()
      if (index > 0 && index < words.length - 1 && SMALL_WORDS.has(clean)) return word
      return word.replace(/[a-z]/i, (letter) => letter.toUpperCase())
    })
    .join(" ")
}

export function publicMoviePath(path: string): string {
  if (path.startsWith("ninejarocks:")) return `fb-${path.slice("ninejarocks:".length)}`
  return path
}

function isMostlyUppercase(value: string): boolean {
  const letters = value.match(/[a-z]/gi) || []
  if (letters.length < 4) return false
  const uppercase = value.match(/[A-Z]/g)?.length || 0
  return uppercase / letters.length > 0.75
}
