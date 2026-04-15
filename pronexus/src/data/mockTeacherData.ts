export interface AttendanceRecord {
  id: string;
  name: string;
  uid: string;
  isPresent: boolean;
  initials: string;
  theme: string;
}

export interface TeacherData {
  overview: {
    totalStudents: number;
    activeGroups: number;
  };
  projects: {
    id: string;
    code: string;
    title: string;
    type: 'minor' | 'major';
    progress: number;
    members: string[]; // Avatars
    deadline?: string;
    validatedGroups?: number;
  }[];
  attendance: {
    date: string;
    lab: string;
    records: AttendanceRecord[];
  };
}

export const mockTeacherData: TeacherData = {
  overview: {
    totalStudents: 124,
    activeGroups: 32,
  },
  projects: [
    {
      id: "PROJ_1",
      code: "CS402",
      title: "Minor Project 2",
      type: "minor",
      progress: 68,
      members: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCXHAlln-OvLrhRrSRjKnouP1ll8FkS-XIQugFMRefi7dBbmhnrWxjmV-z5EGmJYO-naL8nIjb1CNirijecjYmJK-mcev0CMhmTVQ9qMtfIW0AV9hX-302eIHrEcK_yPHUZiIKL8W5kGjFChOSGhmNwxXZFdXwm1tW5HrahadaUJf5BeWbahlqn7h7mNll-O_jYSkYe-k1DYvbUj8vP8RQgqD0iewAhLGxa7QoD-bSetKqdzvU6joUdeicjDdfnLUz7iCCZt2dVEI_w",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC4f8wdtuln0bD1wDt01k_xdNSN0bH9NTMo5L6bG2Gm7Z18mD2RsSywMz7oxwoKBhlc81TpxTO_4o4L7CPxxUYUxCiOS4DZfaAud3o7IbUaoeMOA8tWUm9miEg7gNKqQ4q7masYzIp9jBVV_N-bUvy6VRqo4wG-ntDfnRDP80WGOocdxA6VIOo6sZwQWI4r0I8Adz0tULnYvGH8WtGadpyxtoVIrsy8GzYYGSk6GZHk2xsQh6ficj7-ehXKvofK_KdNTwtAaFXSAn_8",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBGddlkoBMpgcaa306Yly3N9ZZMRdf590few4fddyga7p3RerpC20BLl0HUAHsKTg8CeLdEnbbRJgY5AMHA9vHX030oEhqgBcF9AbMSuHAzANSEhcRnD8ofoU1HBwoRIHoFXPA1H0x3lGqazFbvD6J2ekRrySfWL-CGiOQGL7-82Ur-4DN9SSrhEf_ibOYRrUUfqwrtD26wpYbZnzwsJKwZlVp-Cp0yrHq_BDcf3aE_sT9VO3EpTY4GgJveca93vn30YFRCzImywNJ_"
      ]
    },
    {
      id: "PROJ_2",
      code: "CS801",
      title: "Major Project",
      type: "major",
      progress: 42,
      members: [],
      deadline: "12d 04h",
      validatedGroups: 14,
    }
  ],
  attendance: {
    date: "Oct 24, 2023",
    lab: "Lab 402",
    records: [
      { id: "1", name: "Amit Shah", uid: "2023CSE001", isPresent: true, initials: "AS", theme: "secondary" },
      { id: "2", name: "Bhavna K.", uid: "2023CSE014", isPresent: true, initials: "BK", theme: "tertiary" },
      { id: "3", name: "Chetan P.", uid: "2023CSE025", isPresent: false, initials: "CP", theme: "neutral" },
      { id: "4", name: "Deepak S.", uid: "2023CSE042", isPresent: true, initials: "DS", theme: "secondary" },
      { id: "5", name: "Farhan A.", uid: "2023CSE066", isPresent: true, initials: "FA", theme: "tertiary" },
      { id: "6", name: "Gauri K.", uid: "2023CSE071", isPresent: true, initials: "GK", theme: "primary" },
    ]
  }
};
