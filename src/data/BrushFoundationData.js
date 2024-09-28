// boneAgeData.js
// Use Brush Foundation data to return the standard deviation for age and gender.
// Internal data, not exported
const BFData = {
  male: [
    { age: 3, stdev: 0.69 },
    { age: 6, stdev: 1.13 },
    { age: 9, stdev: 1.43 },
    { age: 12, stdev: 1.97 },
    { age: 18, stdev: 3.52 },
    { age: 24, stdev: 3.92 },
    { age: 30, stdev: 4.52 },
    { age: 36, stdev: 5.08 },
    { age: 42, stdev: 5.4 },
    { age: 48, stdev: 6.66 },
    { age: 54, stdev: 8.36 },
    { age: 60, stdev: 8.79 },
    { age: 72, stdev: 9.17 },
    { age: 84, stdev: 8.91 },
    { age: 96, stdev: 9.1 },
    { age: 108, stdev: 9 },
    { age: 120, stdev: 9.79 },
    { age: 132, stdev: 10.09 },
    { age: 144, stdev: 10.38 },
    { age: 156, stdev: 10.44 },
    { age: 168, stdev: 10.72 },
    { age: 180, stdev: 11.32 },
    { age: 192, stdev: 12.86 },
    { age: 204, stdev: 13.05 },
  ],
  female: [
    { age: 3, stdev: 0.72 },
    { age: 6, stdev: 1.16 },
    { age: 9, stdev: 1.36 },
    { age: 12, stdev: 1.77 },
    { age: 18, stdev: 3.49 },
    { age: 24, stdev: 4.64 },
    { age: 30, stdev: 5.37 },
    { age: 36, stdev: 5.97 },
    { age: 42, stdev: 7.48 },
    { age: 48, stdev: 8.98 },
    { age: 54, stdev: 10.73 },
    { age: 60, stdev: 11.65 },
    { age: 72, stdev: 10.23 },
    { age: 84, stdev: 9.64 },
    { age: 96, stdev: 10.23 },
    { age: 108, stdev: 10.74 },
    { age: 120, stdev: 11.73 },
    { age: 132, stdev: 11.94 },
    { age: 144, stdev: 10.24 },
    { age: 156, stdev: 10.67 },
    { age: 168, stdev: 11.3 },
    { age: 180, stdev: 9.23 },
    { age: 192, stdev: 7.31 },
  ],
};

// Exported function
export function getStandardDeviation(gender, chronologicalAge) {
  // Ensure the gender is either 'male' or 'female'
  if (!["male", "female"].includes(gender)) {
    throw new Error('Invalid gender specified. Must be "male" or "female".');
  }

  const data = BFData[gender];

  // Use binary search or linear search to find the closest age
  // For simplicity, we'll use the linear search here
  let closestDataPoint = data.reduce((prev, curr) => {
    return Math.abs(curr.age - chronologicalAge) <
      Math.abs(prev.age - chronologicalAge)
      ? curr
      : prev;
  });

  return closestDataPoint.stdev;
}
