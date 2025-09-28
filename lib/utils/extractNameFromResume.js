/**
 * Extracts candidate name from resume text
 * @param {string} resumeText - The resume content
 * @returns {string} - Extracted name or fallback
 */
export function extractNameFromResume(resumeText) {
  if (!resumeText || typeof resumeText !== 'string') {
    return 'John';
  }

  try {
    // Clean the text and split into lines
    const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Look for name patterns in the first few lines (typically name is at the top)
    const firstFewLines = lines.slice(0, 5);
    
    for (const line of firstFewLines) {
      // Skip lines that look like headers or common resume sections
      if (line.toLowerCase().includes('resume') || 
          line.toLowerCase().includes('cv') ||
          line.toLowerCase().includes('curriculum') ||
          line.toLowerCase().includes('email') ||
          line.toLowerCase().includes('phone') ||
          line.toLowerCase().includes('address') ||
          line.toLowerCase().includes('objective') ||
          line.toLowerCase().includes('summary') ||
          line.toLowerCase().includes('experience') ||
          line.toLowerCase().includes('education') ||
          line.toLowerCase().includes('skills') ||
          line.toLowerCase().includes('projects')) {
        continue;
      }
      
      // Check if line looks like a name (contains letters, spaces, and reasonable length)
      if (line.length >= 2 && line.length <= 50 && 
          /^[a-zA-Z\s\.\-']+$/.test(line) && 
          !line.includes('@') && 
          !line.includes('http') &&
          !line.includes('www') &&
          !/^\d/.test(line)) {
        
        // Additional validation - should have at least one space (first and last name)
        const words = line.split(/\s+/);
        if (words.length >= 2 && words.every(word => word.length > 0)) {
          return line;
        }
      }
    }
    
    // If no name found in first few lines, try to find it anywhere in the resume
    const allLines = resumeText.split('\n');
    for (const line of allLines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length >= 2 && trimmedLine.length <= 50 && 
          /^[a-zA-Z\s\.\-']+$/.test(trimmedLine) && 
          !trimmedLine.includes('@') && 
          !trimmedLine.includes('http') &&
          !trimmedLine.includes('www') &&
          !/^\d/.test(trimmedLine)) {
        
        const words = trimmedLine.split(/\s+/);
        if (words.length >= 2 && words.every(word => word.length > 0)) {
          return trimmedLine;
        }
      }
    }
    
  } catch (error) {
    console.error('Error extracting name from resume:', error);
  }
  
  // Fallback to generic name
  return 'John';
}

/**
 * Extracts first name from full name
 * @param {string} fullName - The full name
 * @returns {string} - First name or fallback
 */
export function getFirstName(fullName) {
  if (!fullName || fullName === 'John') {
    return 'John';
  }
  
  const firstName = fullName.split(/\s+/)[0];
  return firstName || 'John';
}
