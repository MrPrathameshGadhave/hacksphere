export type JudgeReviewStatus = "pending" | "in-progress" | "reviewed";

export function getJudgeReviewStatusLabel(status: JudgeReviewStatus) {
  switch (status) {
    case "pending":
      return "Ready to Review";
    case "in-progress":
      return "Draft in Progress";
    case "reviewed":
      return "Submitted Review";
    default:
      return "Ready to Review";
  }
}

export function getJudgeReviewStatusClasses(status: JudgeReviewStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "in-progress":
      return "bg-blue-100 text-blue-700";
    case "reviewed":
      return "bg-green-100 text-green-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

export function getJudgeReviewActionLabel(status: JudgeReviewStatus) {
  switch (status) {
    case "pending":
      return "Start Review";
    case "in-progress":
      return "Resume Draft";
    case "reviewed":
      return "View Submitted Review";
    default:
      return "Start Review";
  }
}

export function getJudgeReviewStatusDescription(status: JudgeReviewStatus) {
  switch (status) {
    case "pending":
      return "This assigned review is ready for its first scoring pass.";
    case "in-progress":
      return "A draft review exists and can still be refined before submission.";
    case "reviewed":
      return "This review has already been submitted and is now locked.";
    default:
      return "This assigned review is ready for its first scoring pass.";
  }
}
