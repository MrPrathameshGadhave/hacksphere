export const SUBMISSION_DEADLINE_ISO =
  process.env.NEXT_PUBLIC_HACKATHON_SUBMISSION_DEADLINE || "";

export function getSubmissionDeadlineDate() {
  if (!SUBMISSION_DEADLINE_ISO) {
    console.warn(
      "SUBMISSION_DEADLINE_ISO is not set. Submissions will be disabled by default."
    );
    return null;
  }

  const date = new Date(SUBMISSION_DEADLINE_ISO);
  if (Number.isNaN(date.getTime())) {
    console.error(
      `Invalid SUBMISSION_DEADLINE_ISO format: ${SUBMISSION_DEADLINE_ISO}`
    );
    return null;
  }

  return date;
}

export function isSubmissionDeadlinePassed(now = new Date()) {
  const deadline = getSubmissionDeadlineDate();
  // If deadline is not set, treat it as "already passed" (conservative approach - submissions disabled by default)
  if (!deadline) return true;

  return now.getTime() >= deadline.getTime();
}

export function isSubmissionActive(now = new Date()) {
  const deadline = getSubmissionDeadlineDate();
  // Submissions are only active if deadline is set and not yet passed
  if (!deadline) return false;

  return now.getTime() < deadline.getTime();
}

export function formatSubmissionDeadline() {
  const deadline = getSubmissionDeadlineDate();
  if (!deadline) return "Submission deadline not configured";

  return deadline.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}