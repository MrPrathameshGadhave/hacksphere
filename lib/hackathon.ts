export const SUBMISSION_DEADLINE_ISO =
  process.env.NEXT_PUBLIC_HACKATHON_SUBMISSION_DEADLINE || "";

export function getSubmissionDeadlineDate() {
  if (!SUBMISSION_DEADLINE_ISO) return null;

  const date = new Date(SUBMISSION_DEADLINE_ISO);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

export function isSubmissionDeadlinePassed(now = new Date()) {
  const deadline = getSubmissionDeadlineDate();
  if (!deadline) return false;

  return now.getTime() >= deadline.getTime();
}

export function formatSubmissionDeadline() {
  const deadline = getSubmissionDeadlineDate();
  if (!deadline) return null;

  return deadline.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}