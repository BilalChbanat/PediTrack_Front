// WHO Growth Standards data (simplified example - you'll need full data)
export const WHO_GROWTH_DATA = {
  // Girls 0-24 months
  girls: {
    weightForAge: [
      { age: 0, p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.7, p97: 4.2 },
      // ... more data points
    ],
    heightForAge: [
      { age: 0, p3: 45.6, p15: 47.3, p50: 49.1, p85: 51.0, p97: 52.7 },
      // ... more data points
    ],
    weightForHeight: [
      { height: 45, p3: 2.0, p15: 2.3, p50: 2.7, p85: 3.1, p97: 3.5 },
      // ... more data points
    ]
  },
  // Boys 0-24 months
  boys: {
    weightForAge: [
      { age: 0, p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.7, p97: 4.2 },
      // ... more data points
    ],
    heightForAge: [
      { age: 0, p3: 45.6, p15: 47.3, p50: 49.1, p85: 51.0, p97: 52.7 },
      // ... more data points
    ],
    weightForHeight: [
      { height: 45, p3: 2.0, p15: 2.3, p50: 2.7, p85: 3.1, p97: 3.5 },
      // ... more data points
    ]
    // similar structure as girls
  }
};