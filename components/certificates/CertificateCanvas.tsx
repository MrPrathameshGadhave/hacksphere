import {
  Award,
  Medal,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import type { AdminCertificateItem } from "@/lib/certificate-types";
import { formatCertificateDate } from "@/lib/certificate-types";

function getAwardPresentation(category: AdminCertificateItem["awardCategory"]) {
  switch (category) {
    case "champion":
      return {
        heading: "Certificate of Excellence",
        accentTo: "#a86a11",
        panelTint: "from-[#fff9e8] via-[#fff3d0] to-[#f8e3a7]",
        badgeClasses: "border-[#d9b25a]/60 bg-[#fff4cc] text-[#8a5a00]",
        sealClasses: "border-[#d9b25a]/55 bg-[#fff1bf] text-[#9b650a]",
        borderGlow: "rgba(217,178,90,0.55)",
        Icon: Trophy,
      };
    case "first_runner_up":
      return {
        heading: "Certificate of Distinction",
        accentTo: "#7c8597",
        panelTint: "from-[#f9fafc] via-[#f2f4f8] to-[#e7ebf2]",
        badgeClasses: "border-[#cfd5e2]/70 bg-[#f5f7fb] text-[#596174]",
        sealClasses: "border-[#c8cfde]/60 bg-[#eff2f8] text-[#626b80]",
        borderGlow: "rgba(166,175,196,0.45)",
        Icon: Medal,
      };
    case "second_runner_up":
      return {
        heading: "Certificate of Merit",
        accentTo: "#8e5933",
        panelTint: "from-[#fff5ee] via-[#f9e6d7] to-[#efd0b5]",
        badgeClasses: "border-[#d8a46f]/60 bg-[#fbe6d2] text-[#8e5933]",
        sealClasses: "border-[#d0a17b]/60 bg-[#f8e0cc] text-[#8a5630]",
        borderGlow: "rgba(182,118,67,0.4)",
        Icon: Award,
      };
    case "finalist":
      return {
        heading: "Certificate of Achievement",
        accentTo: "#7b1328",
        panelTint: "from-[#fff7f8] via-[#fdecef] to-[#f9dfe4]",
        badgeClasses: "border-[#d9a3ad]/70 bg-[#fff2f4] text-[#8d1730]",
        sealClasses: "border-[#d496a2]/60 bg-[#fce6ea] text-[#8d1730]",
        borderGlow: "rgba(160,28,51,0.28)",
        Icon: Star,
      };
    default:
      return {
        heading: "Certificate of Participation",
        accentTo: "#24324a",
        panelTint: "from-[#f6f8fb] via-[#eef3f9] to-[#dfe7f3]",
        badgeClasses: "border-[#c5cfdd]/70 bg-[#f3f6fb] text-[#31415d]",
        sealClasses: "border-[#bec8d8]/60 bg-[#edf2f8] text-[#32435f]",
        borderGlow: "rgba(49,65,93,0.2)",
        Icon: ShieldCheck,
      };
  }
}

function getAdaptiveTextClass(
  length: number,
  variants: {
    default: string;
    medium?: string;
    long?: string;
    xlong?: string;
  }
) {
  if (length > 90 && variants.xlong) return variants.xlong;
  if (length > 60 && variants.long) return variants.long;
  if (length > 36 && variants.medium) return variants.medium;
  return variants.default;
}

export default function CertificateCanvas({
  item,
}: {
  item: AdminCertificateItem;
}) {
  const award = getAwardPresentation(item.awardCategory);
  const AccentIcon = award.Icon;
  const headingFont =
    '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif';
  const bodyFont =
    '"Aptos", "Trebuchet MS", "Segoe UI", "Helvetica Neue", sans-serif';
  const citationLength = [
    item.roleLabel,
    item.teamName,
    item.projectTitle,
    item.awardCitation,
  ]
    .join(" ")
    .trim().length;
  const participantNameClass = getAdaptiveTextClass(item.participantName.length, {
    default: "text-[50px] sm:text-[52px]",
    medium: "text-[44px] sm:text-[46px]",
    long: "text-[38px] sm:text-[40px]",
    xlong: "text-[32px] sm:text-[34px]",
  });
  const headingClass = getAdaptiveTextClass(item.awardTitle.length, {
    default: "text-[26px]",
    medium: "text-[24px]",
    long: "text-[21px]",
    xlong: "text-[19px]",
  });
  const citationClass = getAdaptiveTextClass(citationLength, {
    default: "text-[16px] leading-7",
    medium: "text-[15px] leading-7",
    long: "text-[14px] leading-6",
    xlong: "text-[13px] leading-6",
  });
  const recognitionBodyClass = getAdaptiveTextClass(
    `${item.awardTitle} ${item.teamName} ${item.problemTitle}`.length,
    {
      default: "text-[14px] leading-6",
      medium: "text-[13px] leading-6",
      long: "text-[12px] leading-5",
      xlong: "text-[11px] leading-5",
    }
  );
  const certificateNumberClass =
    item.certificateNumber.length > 20
      ? "text-xs tracking-[0.12em] leading-5"
      : "text-sm tracking-[0.2em] leading-5";
  const projectCardValueClass = getAdaptiveTextClass(item.projectTitle.length, {
    default: "text-[18px] leading-snug",
    medium: "text-[17px] leading-snug",
    long: "text-[15px] leading-6",
    xlong: "text-[13px] leading-5",
  });
  const problemCardValueClass = getAdaptiveTextClass(item.problemTitle.length, {
    default: "text-sm leading-6",
    medium: "text-sm leading-5",
    long: "text-[13px] leading-5",
    xlong: "text-[12px] leading-5",
  });
  const collegeCardValueClass = getAdaptiveTextClass(
    (item.college || "HackSphere participant").length,
    {
      default: "text-[18px] leading-snug",
      medium: "text-[16px] leading-snug",
      long: "text-[14px] leading-5",
      xlong: "text-[12px] leading-5",
    }
  );

  return (
    <div
      className="relative mx-auto aspect-[1.414/1] w-[1100px] max-w-none overflow-hidden rounded-[36px] border border-[#7b1328]/10 bg-[#fbf3e4] text-[#301620] shadow-[0_30px_100px_rgba(32,16,25,0.24)] xl:w-[1320px]"
      style={{ fontFamily: bodyFont }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.78),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,247,220,0.92),transparent_26%),linear-gradient(135deg,#fffef8_0%,#fbf1de_38%,#f6e6c8_100%)]" />
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(123,19,40,0.035) 1px, transparent 1px), linear-gradient(rgba(123,19,40,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
        }}
      />
      <div
        className="absolute left-6 top-6 right-6 bottom-6 rounded-[30px] border"
        style={{ borderColor: award.borderGlow }}
      />
      <div className="absolute left-10 top-10 right-10 bottom-10 rounded-[26px] border border-[#7b1328]/18" />
      <div className="absolute -left-16 top-16 h-72 w-72 rounded-full bg-[#8d1730]/10 blur-3xl" />
      <div className="absolute -right-14 bottom-8 h-72 w-72 rounded-full bg-[#c89942]/14 blur-3xl" />
      <div className="absolute left-[8%] top-[18%] h-24 w-24 rounded-full border border-[#cba35a]/35" />
      <div className="absolute right-[8%] top-[14%] h-28 w-28 rounded-full border border-[#8d1730]/18" />
      <div className="absolute inset-x-0 top-[18%] flex justify-center">
        <div className="h-px w-[72%] bg-gradient-to-r from-transparent via-[#8d1730]/25 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-[17%] flex justify-center">
        <div className="h-px w-[72%] bg-gradient-to-r from-transparent via-[#8d1730]/20 to-transparent" />
      </div>

      <div className="relative flex h-full flex-col px-10 py-9 sm:px-12 sm:py-10 lg:px-12 lg:py-11">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.5em] text-[#8d1730]/75">
              TechTitans Presents
            </p>
            <h1
              className="mt-2 text-[36px] font-semibold leading-none text-[#7b1328]"
              style={{ fontFamily: headingFont }}
            >
              HackSphere
            </h1>
            <p className="mt-1.5 text-[13px] font-medium text-[#5b4250]">
              Organized innovation challenge and official leaderboard recognition
            </p>
          </div>

          <div className="max-w-[220px] text-right">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#8d1730]/70">
              Certificate No.
            </p>
            <p
              className={`mt-2 break-all font-semibold text-[#3f2430] ${certificateNumberClass}`}
            >
              {item.certificateNumber}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] shadow-sm ${award.badgeClasses}`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {item.awardLabel}
          </div>
        </div>

        <div className="mt-5 text-center">
          <p className="text-[11px] uppercase tracking-[0.45em] text-[#8d1730]/70">
            This certifies that
          </p>

          <h2
            className={`mx-auto mt-4 max-w-[920px] break-words font-semibold leading-tight text-[#2b1720] ${participantNameClass}`}
            style={{ fontFamily: headingFont }}
          >
            {item.participantName}
          </h2>

          <div className="mt-3 flex items-center justify-center gap-3 text-[#8d1730]">
            <div className="h-px w-14 bg-[#8d1730]/30" />
            <AccentIcon className="h-5 w-5 shrink-0" />
            <div className="h-px w-14 bg-[#8d1730]/30" />
          </div>

          <h3
            className={`mt-4 font-semibold leading-tight ${headingClass}`}
            style={{
              fontFamily: headingFont,
              color: award.accentTo,
            }}
          >
            {award.heading}
          </h3>

          <p
            className={`mx-auto mt-4 max-w-[940px] break-words text-[#4c3741] ${citationClass}`}
          >
            In recognition of outstanding contribution as <strong>{item.roleLabel}</strong>{" "}
            of <strong>{item.teamName}</strong>, for the project{" "}
            <strong>{item.projectTitle}</strong>. This honor is awarded {item.awardCitation}
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <div
            className={`rounded-[28px] border border-white/50 bg-gradient-to-br p-5 shadow-[0_18px_50px_rgba(82,36,38,0.12)] ${award.panelTint}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8d1730]/70">
                  Recognition Statement
                </p>
                <h4
                  className={`mt-2 break-words font-semibold text-[#2b1720] ${headingClass}`}
                  style={{ fontFamily: headingFont }}
                >
                  {item.awardTitle}
                </h4>
              </div>

              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border shadow-sm ${award.sealClasses}`}
              >
                <AccentIcon className="h-6 w-6" />
              </div>
            </div>

            <p className={`mt-4 break-words text-[#4b3640] ${recognitionBodyClass}`}>
              Based on the official HackSphere standings, this certificate recognizes
              the participant&apos;s contribution to a project ranked <strong>#{item.rank}</strong>{" "}
              with a final averaged score of <strong>{item.finalScore}</strong>.
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-3 text-[#4b3640]">
              <div className="rounded-[18px] border border-[#8d1730]/15 bg-white/70 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#8d1730]/65">
                  Team
                </p>
                <p className="mt-1 break-words text-sm font-semibold leading-5">
                  {item.teamName}
                </p>
              </div>
              <div className="rounded-[18px] border border-[#8d1730]/15 bg-white/70 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#8d1730]/65">
                  Problem
                </p>
                <p className={`mt-1 break-words font-semibold text-[#4b3640] ${problemCardValueClass}`}>
                  {item.problemTitle}
                </p>
              </div>
              <div className="rounded-[18px] border border-[#8d1730]/15 bg-white/70 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#8d1730]/65">
                  Reviews
                </p>
                <p className="mt-1 break-words text-sm font-semibold leading-5">
                  {item.reviewsCount}/{item.assignedJudges}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-[#8d1730]/10 bg-white/70 p-4 shadow-[0_12px_30px_rgba(61,28,41,0.08)]">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#8d1730]/65">
                Standing
              </p>
              <p
                className="mt-2 text-[22px] font-semibold leading-snug text-[#28141d]"
                style={{ fontFamily: headingFont }}
              >
                #{item.rank}
              </p>
            </div>

            <div className="rounded-[24px] border border-[#8d1730]/10 bg-white/70 p-4 shadow-[0_12px_30px_rgba(61,28,41,0.08)]">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#8d1730]/65">
                Issue Date
              </p>
              <p
                className="mt-2 text-[18px] font-semibold leading-snug text-[#28141d]"
                style={{ fontFamily: headingFont }}
              >
                {formatCertificateDate(item.issuedAt)}
              </p>
            </div>

            <div className="rounded-[24px] border border-[#8d1730]/10 bg-white/70 p-4 shadow-[0_12px_30px_rgba(61,28,41,0.08)]">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#8d1730]/65">
                College
              </p>
              <p
                className={`mt-2 break-words font-semibold text-[#28141d] ${collegeCardValueClass}`}
                style={{ fontFamily: headingFont }}
              >
                {item.college || "HackSphere participant"}
              </p>
            </div>

            <div className="rounded-[24px] border border-[#8d1730]/10 bg-white/70 p-4 shadow-[0_12px_30px_rgba(61,28,41,0.08)]">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#8d1730]/65">
                Project
              </p>
              <p
                className={`mt-2 break-words font-semibold text-[#28141d] ${projectCardValueClass}`}
                style={{ fontFamily: headingFont }}
              >
                {item.projectTitle}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-6 pt-6">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full border shadow-lg ${award.sealClasses}`}
            >
              <AccentIcon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-[#8d1730]/70">
                Official Seal
              </p>
              <p className="mt-1.5 text-[13px] font-medium text-[#4d3944]">
                HackSphere leaderboard recognition record
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="min-w-[180px] border-t border-[#8d1730]/20 pt-3 text-center">
              <p
                className="text-[18px] font-semibold text-[#2b1720]"
                style={{ fontFamily: headingFont }}
              >
                TechTitans Council
              </p>
              <p className="mt-1.5 text-[11px] uppercase tracking-[0.22em] text-[#8d1730]/65">
                Organizing Committee
              </p>
            </div>

            <div className="min-w-[180px] border-t border-[#8d1730]/20 pt-3 text-center">
              <p
                className="text-[18px] font-semibold text-[#2b1720]"
                style={{ fontFamily: headingFont }}
              >
                Official Standing Board
              </p>
              <p className="mt-1.5 text-[11px] uppercase tracking-[0.22em] text-[#8d1730]/65">
                Verified from leaderboard results
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
