/**
 * Generates a random PIN of specified length
 * @param {number} length - Length of the PIN to generate
 * @returns {string} Random PIN string
 */
const generateRandomPin = (length = 8) => {
  const digits = "0123456789";
  let pin = "";
  for (let i = 0; i < length; i++) {
    pin += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return pin;
};

export default generateRandomPin;

