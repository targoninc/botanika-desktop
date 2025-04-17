/**
 * Utility functions for validation
 */

/**
 * Checks if a number is a valid port number
 * @param port The port number to validate
 * @returns True if the port is valid (1-65535 and an integer)
 */
export function isValidPort(port: number): boolean {
  return port > 0 && port < 65536 && Number.isInteger(port);
}