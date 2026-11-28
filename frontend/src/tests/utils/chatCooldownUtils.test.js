import { describe, test, expect } from "vitest";
import {
  formatCooldownRemaining,
  cooldownErrorMessage,
} from "main/utils/chatCooldownUtils";

describe("chatCooldownUtils", () => {
  test.each([
    [1, "1 second"],
    [45, "45 seconds"],
    [59, "59 seconds"],
    [60, "1 minute"],
    [61, "1 minute 1 second"],
    [120, "2 minutes"],
    [125, "2 minutes 5 seconds"],
  ])("formatCooldownRemaining(%i) is %j", (input, expected) => {
    expect(formatCooldownRemaining(input)).toBe(expected);
  });

  test("cooldownErrorMessage includes the formatted remaining time", () => {
    expect(cooldownErrorMessage(90)).toBe(
      "You are on a chat cooldown. You can send messages again in 1 minute 30 seconds.",
    );
  });
});
