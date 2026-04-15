export interface Teammate {
  id: string;
  name: string;
  role: string;
  phone: string;
  avatarUrl: string;
  isSelf?: boolean;
}

export interface ProjectData {
  id: string;
  title: string;
  mentor: string;
  progress: {
    label: string;
    percentage: number;
    steps: {
      title: string;
      status: 'COMPLETED' | 'IN PROGRESS' | 'UPCOMING';
    }[];
  };
}

export interface StudentData {
  user: {
    avatar: string;
    batch: string;
  };
  activeProject: ProjectData;
  team: {
    name: string;
    size: number;
    members: Teammate[];
  };
  stats: {
    attendance: {
      percentage: number;
      trend: string;
    };
    submissions: string;
    gradePoint: number;
  };
  history: {
    semester: string;
    title: string;
    statusLabel: string;
    statusType: 'grade-a-plus' | 'grade-a' | 'completed';
  }[];
  updates: {
    title: string;
    description: string;
    type: 'error' | 'primary';
  }[];
}

export const mockStudentData: StudentData = {
  user: {
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHLzKnIrG3RwHyMoIzSUNJDeUPIBpiFm1vDuM1ajkITpahRSC1KLNSZ_S4zI6nfBx8ZhSz3leguAFLTrLXiDFrhcm6lpBH2l7yQhfFw0UKAANagjeSl_CwoYTeO4fd844xkjAPZorZcqnzzF3iiFSDQDxgZ3DTsSbx7HntT9I1qVWE-TbVMvlgZWzT0DA1JmTO9KosTTj2ds2ipgCV1oT4Ypfp69_KwoCrTJZwxi6NgmAUP3lkESr_pTTRJrk8N5lTbMRZmST541Th",
    batch: "CSE-AIML 2023-27"
  },
  activeProject: {
    id: "PRJ-2024-089",
    title: "Neural Graph Architectures for Real-time Edge Processing",
    mentor: "Dr. Aris Thorne",
    progress: {
      label: "Review 2",
      percentage: 66,
      steps: [
        { title: "Review 1", status: "COMPLETED" },
        { title: "Review 2", status: "IN PROGRESS" },
        { title: "Review 3", status: "UPCOMING" }
      ]
    }
  },
  team: {
    name: "Team Alpha",
    size: 3,
    members: [
      {
        id: "v",
        name: "Vikram Malhotra",
        role: "Lead Developer",
        phone: "+91 98234-11029",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAp-TQJC_G9K2ZuKB5Y9f_qUzzySoPpkGktgt4Ib9SGTyq4pdK8bjd8tSdQ4x7ptwrnT18_OuTNWTdBEshilYgU3BCiEbZjlAeEP_SOIaxnfzcl012YNRWyh7IgVNuU_GgaS7cKbCfgPzksZkFHpiwODiNYGHROg7-KJCznWgl6S3q4O26krS-RMWhJuScBsX0GTNt-btwADAX_z5r2Iu4Boq4Sbo_WxeNUmEfDoM2bH6JmOg7nVyMEVfyYZI_lZP9o3lKITGv7p2sl"
      },
      {
        id: "a",
        name: "Ananya Singh",
        role: "Data Scientist",
        phone: "+91 91104-55678",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQ4OlXCcDWIx8r_VJNNSFjcob12kSlNA6-SFFA99nULnqIwoEEmRh8-obgXQuSBxpqVnyalajKMz4RXy182n_3ZQSTgP2kt8PKJXYEWJllIfzGPUGQj7o2qn1EZqLU7NfzfsK7MN6ydPhCQGUQmxapLn9tAJyllwhuo3Oc6EPer_oYkvH3KQVK12_llI0ukJ2jCbU6_5_U7BpUYoYSmJQ4AGdn_ObjjZN1nDxz2k0jexPE43jxFrUWBPbhtG9VhoKOmaMBNRBW4cY8"
      },
      {
        id: "r",
        name: "Rohan Verma (You)",
        role: "System Architect",
        phone: "+91 88762-22341",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvLHFlFak2Fa2OAtc2desPzAAuXhJNbF0zosobnLiImRK9Wasu4oYKjmcrKmQHad7TtoVW-0YZkGbmrOhDUJycMBM9NI0Jpp33riBeDHmq7HOeRq8wnbMIjSWCaA5Uso3T1A99TNBgwxe1O4S9J1mg8RLopbPc4lBXg86lQsL1cANlqndLi6yebdrnmfoh3u2sZW14FMZZl4bREUs0zxD9TIQJ-_IOM0WMNDV9aoZPFG_hvyQjD1l4UZxsB3o-WocoUfGZWB2kWwWO",
        isSelf: true
      }
    ]
  },
  stats: {
    attendance: {
      percentage: 94,
      trend: "+2% this month"
    },
    submissions: "12/12",
    gradePoint: 9.2
  },
  history: [
    { semester: "Semester 4", title: "Minor Project 2: Smart Irrigation IoT", statusLabel: "Grade: A+", statusType: "grade-a-plus" },
    { semester: "Semester 3", title: "Minor Project 1: Stock Market Predictor", statusLabel: "Grade: A", statusType: "grade-a" },
    { semester: "Semester 2", title: "Design Thinking: Community Portal", statusLabel: "Completed", statusType: "completed" },
  ],
  updates: [
    { title: "Review 2 Deadline", description: "Submission closes in 48 hours.", type: "error" },
    { title: "Mentor Feedback", description: "Dr. Thorne added comments to R1 docs.", type: "primary" }
  ]
};
