export type CertificateAwardCategory =
  | "champion"
  | "first_runner_up"
  | "second_runner_up"
  | "finalist"
  | "participation";

export type CertificatePublishState = "Draft" | "Published";

export type AdminCertificateItem = {
  id: string;
  teamId: string;
  userId: string;
  participantName: string;
  participantEmail: string;
  college: string;
  roleLabel: string;
  teamName: string;
  projectTitle: string;
  problemTitle: string;
  rank: number;
  finalScore: number;
  reviewsCount: number;
  assignedJudges: number;
  pendingJudges: number;
  awardCategory: CertificateAwardCategory;
  awardTitle: string;
  awardLabel: string;
  awardCitation: string;
  certificateNumber: string;
  issuedAt: string;
  publishState: CertificatePublishState;
};

export type AdminCertificateMeta = {
  publishState: CertificatePublishState;
  publishedAt: string | null;
  issuedAt: string;
  totalCertificates: number;
  totalTeams: number;
  countsByAward: Record<CertificateAwardCategory, number>;
};

export function formatCertificateDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date pending";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}
