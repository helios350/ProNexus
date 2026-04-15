export const adminData = {
  sidebar: {
    brand: "ProNexus",
    subtitle: "Management",
    nav: [
      { label: "Dashboard", icon: "LayoutDashboard", active: true },
      { label: "Projects", icon: "ClipboardList", active: false },
      { label: "Teams", icon: "Users", active: false },
      { label: "Timeline", icon: "Calendar", active: false },
      { label: "Settings", icon: "Settings", active: false }
    ],
    profile: { label: "Profile", icon: "UserCircle" }
  },
  header: {
    contextText: "Batch Context: CSE-AIML 2023-27"
  },
  dashboard: {
    title: "Architect Dashboard",
    subtitle: "System oversight and academic trajectory management.",
    primaryAction: "Create New Batch",
    stats: [
      { id: "PRX-01", label: "Active Batches", count: "42", subtext: "+4 this month", icon: "Layers", colorBg: "bg-secondary-fixed", colorText: "text-secondary" },
      { id: "SYS-META", label: "Total Students", count: "1,284", subtext: "Global Reach", icon: "GraduationCap", colorBg: "bg-tertiary-fixed", colorText: "text-tertiary", isNeutral: true },
      { id: "ACTION_REQ", label: "Unassigned Students", count: "18", subtext: "Pending assignment", icon: "UserSearch", colorBg: "bg-error-container", colorText: "text-error", isError: true }
    ]
  },
  batches: [
    { title: "CSE-AIML 2023-27", id: "BATCH_AI_23_01", students: 64, initial: "CS", status: "Approved", statusColor: "secondary-fixed", textOnStatus: "on-secondary-fixed-variant" },
    { title: "Mech Engineering 2022-26", id: "BATCH_ME_22_05", students: 120, initial: "ME", status: "Pending", statusColor: "tertiary-fixed", textOnStatus: "tertiary" },
    { title: "ECE Robotics 2024-28", id: "BATCH_EC_24_02", students: 48, initial: "EC", status: "Closed", statusColor: "surface-container-high", textOnStatus: "on-surface-variant" }
  ],
  enrollment: [
    { name: "Arjun Sharma", initial: "AS", roll: "CS23AI01", status: "active", bgClass: "bg-primary/10 text-primary" },
    { name: "Meera Patel", initial: "MP", roll: "CS23AI02", status: "active", bgClass: "bg-tertiary-container/10 text-tertiary-container" },
    { name: "Rohan Verma", initial: "RV", roll: "CS23AI03", status: "leave", bgClass: "bg-primary/10 text-primary" },
    { name: "S. Kulkarni", initial: "SK", roll: "CS23AI04", status: "active", bgClass: "bg-surface-container-high text-on-surface-variant" }
  ]
};
