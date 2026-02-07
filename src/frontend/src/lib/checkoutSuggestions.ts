/**
 * Checkout suggestions helper for darts
 * Returns up to 3 popular checkout routes for a given remaining score
 */

export interface CheckoutSuggestion {
  darts: string[];
  description: string;
}

/**
 * Get checkout suggestions for a given remaining score
 * @param remaining - The remaining score (2-170)
 * @param doubleOut - Whether Double Out rule is enabled
 * @returns Array of 0-3 checkout suggestions
 */
export function getCheckoutSuggestions(
  remaining: number,
  doubleOut: boolean
): CheckoutSuggestion[] {
  // Return empty array for out-of-range values
  if (remaining < 2 || remaining > 170) {
    return [];
  }

  // If Double Out is OFF, we don't provide suggestions
  // (any combination works, too many possibilities)
  if (!doubleOut) {
    return [];
  }

  // Curated checkout table for popular finishes with Double Out
  const checkouts: Record<number, CheckoutSuggestion[]> = {
    // 2-40 (single dart finishes)
    2: [{ darts: ['D1'], description: 'Double 1' }],
    4: [{ darts: ['D2'], description: 'Double 2' }],
    6: [{ darts: ['D3'], description: 'Double 3' }],
    8: [{ darts: ['D4'], description: 'Double 4' }],
    10: [{ darts: ['D5'], description: 'Double 5' }],
    12: [{ darts: ['D6'], description: 'Double 6' }],
    14: [{ darts: ['D7'], description: 'Double 7' }],
    16: [{ darts: ['D8'], description: 'Double 8' }],
    18: [{ darts: ['D9'], description: 'Double 9' }],
    20: [{ darts: ['D10'], description: 'Double 10' }],
    22: [{ darts: ['D11'], description: 'Double 11' }],
    24: [{ darts: ['D12'], description: 'Double 12' }],
    26: [{ darts: ['D13'], description: 'Double 13' }],
    28: [{ darts: ['D14'], description: 'Double 14' }],
    30: [{ darts: ['D15'], description: 'Double 15' }],
    32: [{ darts: ['D16'], description: 'Double 16' }],
    34: [{ darts: ['D17'], description: 'Double 17' }],
    36: [{ darts: ['D18'], description: 'Double 18' }],
    38: [{ darts: ['D19'], description: 'Double 19' }],
    40: [{ darts: ['D20'], description: 'Double 20' }],
    
    // 41-50
    41: [{ darts: ['S9', 'D16'], description: '9 → Double 16' }],
    42: [{ darts: ['S10', 'D16'], description: '10 → Double 16' }],
    43: [{ darts: ['S3', 'D20'], description: '3 → Double 20' }],
    44: [{ darts: ['S12', 'D16'], description: '12 → Double 16' }],
    45: [{ darts: ['S13', 'D16'], description: '13 → Double 16' }],
    46: [{ darts: ['S6', 'D20'], description: '6 → Double 20' }],
    47: [{ darts: ['S7', 'D20'], description: '7 → Double 20' }],
    48: [{ darts: ['S16', 'D16'], description: '16 → Double 16' }],
    49: [{ darts: ['S9', 'D20'], description: '9 → Double 20' }],
    50: [
      { darts: ['Bull'], description: 'Bullseye' },
      { darts: ['S10', 'D20'], description: '10 → Double 20' }
    ],
    
    // 51-70
    51: [{ darts: ['S11', 'D20'], description: '11 → Double 20' }],
    52: [{ darts: ['S12', 'D20'], description: '12 → Double 20' }],
    53: [{ darts: ['S13', 'D20'], description: '13 → Double 20' }],
    54: [{ darts: ['S14', 'D20'], description: '14 → Double 20' }],
    55: [{ darts: ['S15', 'D20'], description: '15 → Double 20' }],
    56: [{ darts: ['S16', 'D20'], description: '16 → Double 20' }],
    57: [{ darts: ['S17', 'D20'], description: '17 → Double 20' }],
    58: [{ darts: ['S18', 'D20'], description: '18 → Double 20' }],
    59: [{ darts: ['S19', 'D20'], description: '19 → Double 20' }],
    60: [{ darts: ['S20', 'D20'], description: '20 → Double 20' }],
    61: [{ darts: ['T15', 'D8'], description: 'Treble 15 → Double 8' }],
    62: [{ darts: ['T10', 'D16'], description: 'Treble 10 → Double 16' }],
    63: [{ darts: ['T13', 'D12'], description: 'Treble 13 → Double 12' }],
    64: [{ darts: ['T16', 'D8'], description: 'Treble 16 → Double 8' }],
    65: [{ darts: ['T11', 'D16'], description: 'Treble 11 → Double 16' }],
    66: [{ darts: ['T10', 'D18'], description: 'Treble 10 → Double 18' }],
    67: [{ darts: ['T17', 'D8'], description: 'Treble 17 → Double 8' }],
    68: [{ darts: ['T16', 'D10'], description: 'Treble 16 → Double 10' }],
    69: [{ darts: ['T19', 'D6'], description: 'Treble 19 → Double 6' }],
    70: [{ darts: ['T18', 'D8'], description: 'Treble 18 → Double 8' }],
    
    // 71-90
    71: [{ darts: ['T13', 'D16'], description: 'Treble 13 → Double 16' }],
    72: [{ darts: ['T16', 'D12'], description: 'Treble 16 → Double 12' }],
    73: [{ darts: ['T19', 'D8'], description: 'Treble 19 → Double 8' }],
    74: [{ darts: ['T14', 'D16'], description: 'Treble 14 → Double 16' }],
    75: [{ darts: ['T17', 'D12'], description: 'Treble 17 → Double 12' }],
    76: [{ darts: ['T20', 'D8'], description: 'Treble 20 → Double 8' }],
    77: [{ darts: ['T19', 'D10'], description: 'Treble 19 → Double 10' }],
    78: [{ darts: ['T18', 'D12'], description: 'Treble 18 → Double 12' }],
    79: [{ darts: ['T19', 'D11'], description: 'Treble 19 → Double 11' }],
    80: [{ darts: ['T20', 'D10'], description: 'Treble 20 → Double 10' }],
    81: [{ darts: ['T19', 'D12'], description: 'Treble 19 → Double 12' }],
    82: [{ darts: ['T14', 'D20'], description: 'Treble 14 → Double 20' }],
    83: [{ darts: ['T17', 'D16'], description: 'Treble 17 → Double 16' }],
    84: [{ darts: ['T20', 'D12'], description: 'Treble 20 → Double 12' }],
    85: [{ darts: ['T15', 'D20'], description: 'Treble 15 → Double 20' }],
    86: [{ darts: ['T18', 'D16'], description: 'Treble 18 → Double 16' }],
    87: [{ darts: ['T17', 'D18'], description: 'Treble 17 → Double 18' }],
    88: [{ darts: ['T16', 'D20'], description: 'Treble 16 → Double 20' }],
    89: [{ darts: ['T19', 'D16'], description: 'Treble 19 → Double 16' }],
    90: [{ darts: ['T18', 'D18'], description: 'Treble 18 → Double 18' }],
    
    // 91-110
    91: [{ darts: ['T17', 'D20'], description: 'Treble 17 → Double 20' }],
    92: [{ darts: ['T20', 'D16'], description: 'Treble 20 → Double 16' }],
    93: [{ darts: ['T19', 'D18'], description: 'Treble 19 → Double 18' }],
    94: [{ darts: ['T18', 'D20'], description: 'Treble 18 → Double 20' }],
    95: [{ darts: ['T19', 'D19'], description: 'Treble 19 → Double 19' }],
    96: [{ darts: ['T20', 'D18'], description: 'Treble 20 → Double 18' }],
    97: [
      { darts: ['T19', 'D20'], description: 'Treble 19 → Double 20' },
      { darts: ['T15', 'D26'], description: 'Treble 15 → Double 26' }
    ],
    98: [{ darts: ['T20', 'D19'], description: 'Treble 20 → Double 19' }],
    99: [{ darts: ['T19', 'S10', 'D16'], description: 'T19 → 10 → D16' }],
    100: [{ darts: ['T20', 'D20'], description: 'Treble 20 → Double 20' }],
    101: [
      { darts: ['T17', 'Bull'], description: 'Treble 17 → Bullseye' },
      { darts: ['T20', 'S9', 'D16'], description: 'T20 → 9 → D16' }
    ],
    102: [{ darts: ['T20', 'S10', 'D16'], description: 'T20 → 10 → D16' }],
    103: [{ darts: ['T19', 'S6', 'D20'], description: 'T19 → 6 → D20' }],
    104: [{ darts: ['T18', 'Bull'], description: 'Treble 18 → Bullseye' }],
    105: [{ darts: ['T20', 'S13', 'D16'], description: 'T20 → 13 → D16' }],
    106: [{ darts: ['T20', 'S6', 'D20'], description: 'T20 → 6 → D20' }],
    107: [
      { darts: ['T19', 'Bull'], description: 'Treble 19 → Bullseye' },
      { darts: ['T19', 'S10', 'D20'], description: 'T19 → 10 → D20' }
    ],
    108: [{ darts: ['T20', 'S16', 'D16'], description: 'T20 → 16 → D16' }],
    109: [{ darts: ['T20', 'S9', 'D20'], description: 'T20 → 9 → D20' }],
    110: [
      { darts: ['T20', 'Bull'], description: 'Treble 20 → Bullseye' },
      { darts: ['T20', 'S10', 'D20'], description: 'T20 → 10 → D20' }
    ],
    
    // 111-130
    111: [{ darts: ['T19', 'S14', 'D20'], description: 'T19 → 14 → D20' }],
    112: [{ darts: ['T20', 'S12', 'D20'], description: 'T20 → 12 → D20' }],
    113: [{ darts: ['T19', 'S16', 'D20'], description: 'T19 → 16 → D20' }],
    114: [{ darts: ['T20', 'S14', 'D20'], description: 'T20 → 14 → D20' }],
    115: [{ darts: ['T19', 'S18', 'D20'], description: 'T19 → 18 → D20' }],
    116: [{ darts: ['T20', 'S16', 'D20'], description: 'T20 → 16 → D20' }],
    117: [{ darts: ['T19', 'S20', 'D20'], description: 'T19 → 20 → D20' }],
    118: [{ darts: ['T20', 'S18', 'D20'], description: 'T20 → 18 → D20' }],
    119: [{ darts: ['T19', 'T10', 'D8'], description: 'T19 → T10 → D8' }],
    120: [{ darts: ['T20', 'S20', 'D20'], description: 'T20 → 20 → D20' }],
    121: [{ darts: ['T17', 'T10', 'D20'], description: 'T17 → T10 → D20' }],
    122: [{ darts: ['T18', 'T18', 'D7'], description: 'T18 → T18 → D7' }],
    123: [{ darts: ['T19', 'T16', 'D6'], description: 'T19 → T16 → D6' }],
    124: [{ darts: ['T20', 'T16', 'D8'], description: 'T20 → T16 → D8' }],
    125: [{ darts: ['T20', 'T15', 'D10'], description: 'T20 → T15 → D10' }],
    126: [{ darts: ['T19', 'T19', 'D6'], description: 'T19 → T19 → D6' }],
    127: [{ darts: ['T20', 'T17', 'D8'], description: 'T20 → T17 → D8' }],
    128: [{ darts: ['T18', 'T18', 'D10'], description: 'T18 → T18 → D10' }],
    129: [{ darts: ['T19', 'T16', 'D12'], description: 'T19 → T16 → D12' }],
    130: [{ darts: ['T20', 'T18', 'D8'], description: 'T20 → T18 → D8' }],
    
    // 131-150
    131: [{ darts: ['T20', 'T13', 'D16'], description: 'T20 → T13 → D16' }],
    132: [{ darts: ['T20', 'T16', 'D12'], description: 'T20 → T16 → D12' }],
    133: [{ darts: ['T20', 'T19', 'D8'], description: 'T20 → T19 → D8' }],
    134: [{ darts: ['T20', 'T14', 'D16'], description: 'T20 → T14 → D16' }],
    135: [{ darts: ['T20', 'T17', 'D12'], description: 'T20 → T17 → D12' }],
    136: [{ darts: ['T20', 'T20', 'D8'], description: 'T20 → T20 → D8' }],
    137: [{ darts: ['T20', 'T19', 'D10'], description: 'T20 → T19 → D10' }],
    138: [{ darts: ['T20', 'T18', 'D12'], description: 'T20 → T18 → D12' }],
    139: [{ darts: ['T20', 'T19', 'D11'], description: 'T20 → T19 → D11' }],
    140: [{ darts: ['T20', 'T20', 'D10'], description: 'T20 → T20 → D10' }],
    141: [{ darts: ['T20', 'T19', 'D12'], description: 'T20 → T19 → D12' }],
    142: [{ darts: ['T20', 'T14', 'D20'], description: 'T20 → T14 → D20' }],
    143: [{ darts: ['T20', 'T17', 'D16'], description: 'T20 → T17 → D16' }],
    144: [{ darts: ['T20', 'T20', 'D12'], description: 'T20 → T20 → D12' }],
    145: [{ darts: ['T20', 'T15', 'D20'], description: 'T20 → T15 → D20' }],
    146: [{ darts: ['T20', 'T18', 'D16'], description: 'T20 → T18 → D16' }],
    147: [{ darts: ['T20', 'T17', 'D18'], description: 'T20 → T17 → D18' }],
    148: [{ darts: ['T20', 'T16', 'D20'], description: 'T20 → T16 → D20' }],
    149: [{ darts: ['T20', 'T19', 'D16'], description: 'T20 → T19 → D16' }],
    150: [{ darts: ['T20', 'T18', 'D18'], description: 'T20 → T18 → D18' }],
    
    // 151-170
    151: [{ darts: ['T20', 'T17', 'D20'], description: 'T20 → T17 → D20' }],
    152: [{ darts: ['T20', 'T20', 'D16'], description: 'T20 → T20 → D16' }],
    153: [{ darts: ['T20', 'T19', 'D18'], description: 'T20 → T19 → D18' }],
    154: [{ darts: ['T20', 'T18', 'D20'], description: 'T20 → T18 → D20' }],
    155: [{ darts: ['T20', 'T19', 'D19'], description: 'T20 → T19 → D19' }],
    156: [{ darts: ['T20', 'T20', 'D18'], description: 'T20 → T20 → D18' }],
    157: [{ darts: ['T20', 'T19', 'D20'], description: 'T20 → T19 → D20' }],
    158: [{ darts: ['T20', 'T20', 'D19'], description: 'T20 → T20 → D19' }],
    159: [{ darts: ['T20', 'T19', 'S10', 'D16'], description: 'T20 → T19 → 10 → D16' }],
    160: [{ darts: ['T20', 'T20', 'D20'], description: 'T20 → T20 → D20' }],
    161: [{ darts: ['T20', 'T17', 'Bull'], description: 'T20 → T17 → Bull' }],
    164: [{ darts: ['T20', 'T18', 'Bull'], description: 'T20 → T18 → Bull' }],
    167: [{ darts: ['T20', 'T19', 'Bull'], description: 'T20 → T19 → Bull' }],
    170: [{ darts: ['T20', 'T20', 'Bull'], description: 'T20 → T20 → Bull' }],
  };

  return checkouts[remaining] || [];
}
