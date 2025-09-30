export function cleanCodeBlock(text) {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (match) {
    const cleaned = match[1].trim();
    return JSON.parse(cleaned);
  }

  try {
    return JSON.parse(text.trim());
  } catch (err) {
    throw new Error("Invalid JSON: Could not extract or parse a valid JSON block.");
  }
}

export function extractJsonBlock(text) {
  if (!text) return "";

  // Normalize, strip typical wrappers and any fenced blocks first
  let cleanedText = String(text)
    .replace(/^<s>\s*/i, '')
    .replace(/^\[ASSISTANT\]\s*/i, '')
    .replace(/```[a-zA-Z]*\s*([\s\S]*?)\s*```/g, '$1')
    .replace(/```/g, '')
    .trim();

  // Helper to extract the first complete JSON (object or array) by bracket matching
  const extractByBrackets = (source) => {
    const startIdx = source.search(/[\[{]/);
    if (startIdx === -1) return "";
    const startChar = source[startIdx];
    const endChar = startChar === '{' ? '}' : ']';
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = startIdx; i < source.length; i++) {
      const ch = source[i];
      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (ch === '\\') {
          escaped = true;
        } else if (ch === '"') {
          inString = false;
        }
      } else {
        if (ch === '"') {
          inString = true;
        } else if (ch === startChar) {
          depth++;
        } else if (ch === endChar) {
          depth--;
          if (depth === 0) {
            return source.slice(startIdx, i + 1).trim();
          }
        }
      }
    }
    return "";
  };

  const candidate = extractByBrackets(cleanedText);
  if (candidate) return candidate;

  // As a last resort, try to locate the widest object/array using naive bounds
  const arrayStart = cleanedText.indexOf('[');
  const arrayEnd = cleanedText.lastIndexOf(']');
  if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
    return cleanedText.slice(arrayStart, arrayEnd + 1).trim();
  }
  const objectStart = cleanedText.indexOf('{');
  const objectEnd = cleanedText.lastIndexOf('}');
  if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
    return cleanedText.slice(objectStart, objectEnd + 1).trim();
  }

  return "";
}
