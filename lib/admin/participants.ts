import Team from "@/models/Team";
import User from "@/models/User";

export type TeamStatus = "active" | "pending" | "disqualified";

export async function buildParticipantResponse(userId: string) {
  const user = await User.findById(userId)
    .select("name email college isApproved createdAt role")
    .lean();

  if (!user || user.role !== "participant") {
    return null;
  }

  const team = await Team.findOne({
    $or: [{ leader: user._id }, { members: user._id }],
  })
    .select("teamName status leader members")
    .lean();

  const isLeader = team ? String(team.leader) === String(user._id) : false;

  return {
    id: String(user._id),
    name: user.name || "",
    email: user.email || "",
    college: user.college || "",
    team: team?.teamName || "Not Assigned",
    teamId: team ? String(team._id) : null,
    teamStatus: team ? ((team.status || "pending") as TeamStatus) : null,
    isLeader,
    status: user.isApproved ? "Approved" : "Pending",
    joinedAt: user.createdAt,
  };
}
