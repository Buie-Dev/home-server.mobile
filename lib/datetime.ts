export const formatTime = (seconds: number): string => {
  const totalSeconds = Math.floor(seconds); // Remove any decimals
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s}s`;
};
