/**
 * Parse spoken English transcript into a numeric darts score.
 * Handles common patterns like "one forty", "one hundred and forty", "sixty", "one eighty".
 * Returns null if the transcript cannot be parsed into a valid number.
 */
export function parseVoiceScore(transcript: string): number | null {
  if (!transcript) return null;

  // Normalize: lowercase, trim, remove extra spaces
  const normalized = transcript.toLowerCase().trim().replace(/\s+/g, ' ');

  // Direct number match (e.g., "140", "60")
  const directMatch = normalized.match(/^\d+$/);
  if (directMatch) {
    return parseInt(directMatch[0], 10);
  }

  // Word-to-number mappings
  const ones: Record<string, number> = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9,
  };

  const teens: Record<string, number> = {
    ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
    fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  };

  const tens: Record<string, number> = {
    twenty: 20, thirty: 30, forty: 40, fifty: 50,
    sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  };

  // Remove "and" for easier parsing
  const withoutAnd = normalized.replace(/\band\b/g, '').replace(/\s+/g, ' ').trim();

  // Pattern: "one hundred forty" or "one hundred and forty"
  const hundredPattern = /^(one|two)\s+hundred\s*(.*)$/;
  const hundredMatch = withoutAnd.match(hundredPattern);
  if (hundredMatch) {
    const hundredValue = hundredMatch[1] === 'one' ? 100 : 200;
    const remainder = hundredMatch[2].trim();
    
    if (!remainder) {
      return hundredValue;
    }

    // Parse remainder (e.g., "forty", "eighty")
    const remainderValue = parseSimpleNumber(remainder, ones, teens, tens);
    if (remainderValue !== null) {
      return hundredValue + remainderValue;
    }
  }

  // Pattern: "one forty", "one eighty" (compound without "hundred")
  const compoundPattern = /^(one|two)\s+(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)$/;
  const compoundMatch = normalized.match(compoundPattern);
  if (compoundMatch) {
    const firstPart = ones[compoundMatch[1]] || 0;
    const secondPart = tens[compoundMatch[2]] || 0;
    return firstPart * 100 + secondPart;
  }

  // Simple number (e.g., "sixty", "twenty five", "eighteen")
  return parseSimpleNumber(withoutAnd, ones, teens, tens);
}

/**
 * Parse simple numbers (0-99) from words
 */
function parseSimpleNumber(
  text: string,
  ones: Record<string, number>,
  teens: Record<string, number>,
  tens: Record<string, number>
): number | null {
  const normalized = text.trim();

  // Check teens first
  if (teens[normalized] !== undefined) {
    return teens[normalized];
  }

  // Check tens
  if (tens[normalized] !== undefined) {
    return tens[normalized];
  }

  // Check ones
  if (ones[normalized] !== undefined) {
    return ones[normalized];
  }

  // Pattern: "twenty five", "forty two"
  const parts = normalized.split(' ');
  if (parts.length === 2) {
    const tensValue = tens[parts[0]];
    const onesValue = ones[parts[1]];
    if (tensValue !== undefined && onesValue !== undefined) {
      return tensValue + onesValue;
    }
  }

  return null;
}
