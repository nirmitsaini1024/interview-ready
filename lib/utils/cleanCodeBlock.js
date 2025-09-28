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

  let cleanedText = text
    .replace(/^<s>\s*/, '') // Remove <s> prefix with optional whitespace
    .replace(/^\[ASSISTANT\]\s*/, '') // Remove [ASSISTANT] prefix
    .replace(/^```json\s*/i, '') // Remove opening ```json
    .replace(/\s*```$/, '') // Remove closing ```
    .replace(/^\s*/, '') // Remove leading whitespace
    .trim();

  // Additional cleaning for edge cases
  if (cleanedText.startsWith('<s>')) {
    cleanedText = cleanedText.replace(/^<s>\s*/, '');
  }

  console.log("Original text:", text);
  console.log("Cleaned text:", cleanedText);

  // First try to extract JSON from code blocks
  const codeBlockMatch = cleanedText.match(/```json\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Try to find JSON array or object
  const arrayStart = cleanedText.indexOf("[");
  const arrayEnd = cleanedText.lastIndexOf("]");
  const objectStart = cleanedText.indexOf("{");
  const objectEnd = cleanedText.lastIndexOf("}");

  // Check if we have a valid array
  if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
    return cleanedText.slice(arrayStart, arrayEnd + 1).trim();
  }

  // Check if we have a valid object
  if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
    return cleanedText.slice(objectStart, objectEnd + 1).trim();
  }

  // Fallback: try to parse the entire cleaned text if it looks like JSON
  if ((cleanedText.startsWith('[') && cleanedText.endsWith(']')) || 
      (cleanedText.startsWith('{') && cleanedText.endsWith('}'))) {
    try {
      JSON.parse(cleanedText);
      return cleanedText;
    } catch (e) {
      // Not valid JSON, continue
    }
  }

  return "";
}
