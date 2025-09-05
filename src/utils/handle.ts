// Function to generate a timestamp-based handle following the pattern ^\\d{8}\\d{9}.{3}\\d{15}$
export const generateTimestampHandle = (): string => {
  // Get current timestamp in YYYYMMDD format (8 digits)
  const now = new Date();
  const timestamp =
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0");

  // Generate 9 random digits
  const randomDigits = Math.floor(Math.random() * 1000000000)
    .toString()
    .padStart(9, "0");

  // Fixed 3 characters (you can change these as needed)
  const fixedChars = "TFY";

  // Generate 15 random digits
  const randomDigits15 = Math.floor(Math.random() * 1000000000000000)
    .toString()
    .padStart(15, "0");

  return timestamp + randomDigits + fixedChars + randomDigits15;
};
