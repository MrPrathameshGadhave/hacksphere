export type PublicProblemStatement = {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  shortDescription: string;
  fullDescription: string;
  objective: string;
  expectedOutcome: string;
  suggestedTechnologies: string[];
  rules: string[];
};

export const publicProblemStatements: PublicProblemStatement[] = [
  {
    id: "1",
    slug: "smart-education-engagement-platform",
    title: "Smart Education Engagement Platform",
    category: "Education",
    difficulty: "Medium",
    shortDescription:
      "Build a platform that improves student engagement, attendance tracking, and personalized learning support.",
    fullDescription:
      "Design and develop a platform that helps educational institutions improve student engagement through attendance visibility, interaction support, and academic assistance features. The solution should focus on making learning more trackable, interactive, and student-centered.",
    objective:
      "To improve visibility into student engagement and provide a better digital learning support experience.",
    expectedOutcome:
      "A digital solution that helps students and institutions track participation, identify gaps, and support academic performance.",
    suggestedTechnologies: ["Next.js", "Node.js", "MongoDB", "Analytics"],
    rules: [
      "The solution must address a real education engagement challenge.",
      "The concept should be practical and scalable.",
      "User roles and platform usability should be clearly explained.",
    ],
  },
  {
    id: "2",
    slug: "digital-healthcare-support-system",
    title: "Digital Healthcare Support System",
    category: "Healthcare",
    difficulty: "Hard",
    shortDescription:
      "Create a solution for patient support, digital records access, service coordination, or healthcare guidance.",
    fullDescription:
      "Build a healthcare-focused digital system that improves patient support, service access, healthcare communication, or record visibility. The platform should aim to reduce confusion, improve accessibility, and simplify user interaction with healthcare processes.",
    objective:
      "To create a patient-centered digital support layer for healthcare-related workflows.",
    expectedOutcome:
      "A solution that improves access, coordination, clarity, or support in a healthcare environment.",
    suggestedTechnologies: ["Cloud", "Authentication", "Dashboard", "Database"],
    rules: [
      "The concept must focus on healthcare usability or access improvement.",
      "The system should demonstrate clear end-user value.",
      "Sensitive data handling should be considered in the approach.",
    ],
  },
  {
    id: "3",
    slug: "smart-city-issue-reporting",
    title: "Smart City Issue Reporting",
    category: "Smart City",
    difficulty: "Medium",
    shortDescription:
      "Design a system for reporting, tracking, and managing civic or public infrastructure issues.",
    fullDescription:
      "Create a civic-tech platform that helps citizens report local infrastructure issues such as potholes, waste problems, broken streetlights, or water-related issues. The solution should make reporting more structured and visible while improving issue tracking.",
    objective:
      "To improve public issue reporting and visibility for civic infrastructure problems.",
    expectedOutcome:
      "A system that allows structured reporting, tracking, and status updates for city-related issues.",
    suggestedTechnologies: ["Maps", "Dashboard", "Notifications", "Mobile UI"],
    rules: [
      "The issue reporting flow should be simple and practical.",
      "Status visibility should be clearly represented.",
      "Location or categorization support is strongly encouraged.",
    ],
  },
  {
    id: "4",
    slug: "women-safety-emergency-assistant",
    title: "Women Safety Emergency Assistant",
    category: "Social Impact",
    difficulty: "Hard",
    shortDescription:
      "Build a safety-focused emergency response assistant with alert, support, and visibility features.",
    fullDescription:
      "Create a solution that supports emergency safety use cases through alerts, emergency communication, quick actions, and visibility features. The solution should focus on practical safety support and usability under urgent conditions.",
    objective:
      "To improve personal safety response support through a digital emergency assistant.",
    expectedOutcome:
      "A solution that can assist users in emergency situations with clarity, speed, and confidence.",
    suggestedTechnologies: ["Realtime", "Location", "Notifications", "Mobile UX"],
    rules: [
      "Emergency access must be fast and intuitive.",
      "The design should prioritize practical use under stress.",
      "The safety workflow must be clearly demonstrated.",
    ],
  },
  {
    id: "5",
    slug: "green-innovation-tracker",
    title: "Green Innovation Tracker",
    category: "Sustainability",
    difficulty: "Easy",
    shortDescription:
      "Create a platform to track eco-friendly actions, green goals, and sustainability habits.",
    fullDescription:
      "Build a sustainability-focused digital platform that encourages and tracks eco-friendly behavior, green habits, sustainability targets, and environmental awareness. The solution should make sustainability participation more engaging and measurable.",
    objective:
      "To increase visibility and motivation around sustainable behavior and green goals.",
    expectedOutcome:
      "A simple but effective platform for tracking, encouraging, or reporting sustainable activities.",
    suggestedTechnologies: ["Charts", "Dashboard", "Gamification", "Reports"],
    rules: [
      "The concept should clearly connect to sustainability or environmental goals.",
      "Tracking or measurement should be visible in the platform.",
      "The user experience should feel motivating and clear.",
    ],
  },
  {
    id: "6",
    slug: "startup-idea-validation-assistant",
    title: "Startup Idea Validation Assistant",
    category: "Innovation",
    difficulty: "Medium",
    shortDescription:
      "Develop a tool that helps founders or students validate startup ideas through structured analysis.",
    fullDescription:
      "Create a platform that helps users assess startup ideas through structured thinking, market direction, validation checkpoints, and early-stage clarity. The solution should help reduce guesswork in evaluating business ideas.",
    objective:
      "To help users move from raw startup ideas to better-informed early validation.",
    expectedOutcome:
      "A structured assistant or platform that makes startup idea analysis more practical and accessible.",
    suggestedTechnologies: ["Forms", "AI", "Analytics", "Recommendation Logic"],
    rules: [
      "The solution must offer structured validation flow.",
      "Insights should be practical and understandable.",
      "The value to early-stage founders or students should be clear.",
    ],
  },
  {
    id: "7",
    slug: "campus-networking-platform",
    title: "Campus Networking Platform",
    category: "Student Community",
    difficulty: "Medium",
    shortDescription:
      "Build a platform that helps students connect, collaborate, and discover academic or event opportunities.",
    fullDescription:
      "Design a campus networking solution where students can connect with peers, share opportunities, discover events, and collaborate academically or professionally. The goal is to create a stronger campus digital community.",
    objective:
      "To improve student connections and opportunity visibility inside the campus ecosystem.",
    expectedOutcome:
      "A community-oriented platform that helps students interact, discover, and collaborate more effectively.",
    suggestedTechnologies: ["Feeds", "Messaging", "Events", "Profiles"],
    rules: [
      "The system must support useful campus-level collaboration or connection.",
      "The experience should remain student-focused and simple to use.",
      "Opportunity discovery should be easy and visible.",
    ],
  },
  {
    id: "8",
    slug: "mental-wellness-support-hub",
    title: "Mental Wellness Support Hub",
    category: "Wellness",
    difficulty: "Medium",
    shortDescription:
      "Create a platform for mental wellness support, routines, guided help, and resource visibility.",
    fullDescription:
      "Build a wellness-oriented platform that gives users access to mental wellness resources, self-help support, routine tracking, or guided improvement flows. The solution should focus on supportive, usable, and calm interaction design.",
    objective:
      "To make wellness-related support more accessible and structured through a digital experience.",
    expectedOutcome:
      "A platform that supports users through helpful wellness resources, guided routines, or structured self-support features.",
    suggestedTechnologies: ["Dashboard", "Reminders", "Content Modules", "Progress Tracking"],
    rules: [
      "The platform should be supportive and easy to navigate.",
      "The wellness flow should feel safe, clear, and useful.",
      "The solution should avoid complexity for users in need of quick support.",
    ],
  },
];