/**
 * Validates whether an email string is correct.
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validates a potential profile name.
 */
export function isValidName(name: string): boolean {
  return typeof name === "string" && name.trim().length >= 2;
}

/**
 * Validates if the uploaded knowledge base record content is sufficiently substantive.
 */
export function isValidKnowledge(content: string): boolean {
  return typeof content === "string" && content.trim().length >= 20;
}
