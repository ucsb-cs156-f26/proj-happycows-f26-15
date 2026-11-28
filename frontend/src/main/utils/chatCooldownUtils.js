const plural = (count, unit) => `${count} ${unit}${count === 1 ? "" : "s"}`;

export function formatCooldownRemaining(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) {
    return plural(seconds, "second");
  }
  if (seconds === 0) {
    return plural(minutes, "minute");
  }
  return `${plural(minutes, "minute")} ${plural(seconds, "second")}`;
}

export function cooldownErrorMessage(totalSeconds) {
  return `You are on a chat cooldown. You can send messages again in ${formatCooldownRemaining(totalSeconds)}.`;
}
