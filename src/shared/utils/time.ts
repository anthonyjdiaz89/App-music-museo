/**
 * Formats milliseconds into MM:SS format
 * @param millis Number of milliseconds
 * @returns Formatted string (e.g. "3:45")
 */
export const formatTime = (millis: number): string => {
  if (!millis || millis < 0) return '0:00';
  
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
