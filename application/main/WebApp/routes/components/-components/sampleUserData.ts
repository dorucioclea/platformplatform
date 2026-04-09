export interface SampleUser {
  id: number;
  name: string;
  initials: string;
  email: string;
  role: "Owner" | "Admin" | "Member";
  createdAt: string;
  lastSeenAt: string;
}

export const sampleUsers: SampleUser[] = [
  {
    id: 1,
    name: "Thomas Jespersen",
    initials: "TJ",
    email: "tje@mentum.dk",
    role: "Owner",
    createdAt: "2025-11-12",
    lastSeenAt: "2026-04-09"
  },
  {
    id: 2,
    name: "Alice Johnson",
    initials: "AJ",
    email: "alice@mentum.dk",
    role: "Admin",
    createdAt: "2025-12-03",
    lastSeenAt: "2026-04-08"
  },
  {
    id: 3,
    name: "Bob Smith",
    initials: "BS",
    email: "bob@mentum.dk",
    role: "Member",
    createdAt: "2026-01-15",
    lastSeenAt: "2026-04-07"
  },
  {
    id: 4,
    name: "Carol Williams",
    initials: "CW",
    email: "carol@mentum.dk",
    role: "Member",
    createdAt: "2026-01-22",
    lastSeenAt: "2026-04-05"
  },
  {
    id: 5,
    name: "David Brown",
    initials: "DB",
    email: "david@mentum.dk",
    role: "Admin",
    createdAt: "2026-02-01",
    lastSeenAt: "2026-04-09"
  },
  {
    id: 6,
    name: "Eva Martinez",
    initials: "EM",
    email: "eva@mentum.dk",
    role: "Member",
    createdAt: "2026-02-10",
    lastSeenAt: "2026-04-06"
  },
  {
    id: 7,
    name: "Frank Lee",
    initials: "FL",
    email: "frank@mentum.dk",
    role: "Member",
    createdAt: "2026-02-18",
    lastSeenAt: "2026-04-04"
  },
  {
    id: 8,
    name: "Grace Kim",
    initials: "GK",
    email: "grace@mentum.dk",
    role: "Admin",
    createdAt: "2026-03-01",
    lastSeenAt: "2026-04-08"
  },
  {
    id: 9,
    name: "Henry Chen",
    initials: "HC",
    email: "henry@mentum.dk",
    role: "Member",
    createdAt: "2026-03-10",
    lastSeenAt: "2026-04-03"
  },
  {
    id: 10,
    name: "Iris Patel",
    initials: "IP",
    email: "iris@mentum.dk",
    role: "Member",
    createdAt: "2026-03-15",
    lastSeenAt: "2026-04-09"
  },
  {
    id: 11,
    name: "Jack Wilson",
    initials: "JW",
    email: "jack@mentum.dk",
    role: "Member",
    createdAt: "2026-03-20",
    lastSeenAt: "2026-04-02"
  },
  {
    id: 12,
    name: "Kate Davis",
    initials: "KD",
    email: "kate@mentum.dk",
    role: "Member",
    createdAt: "2026-03-28",
    lastSeenAt: "2026-04-07"
  }
];

export const pageSize = 5;

export const roleVariant: Record<SampleUser["role"], "default" | "secondary" | "outline"> = {
  Owner: "default",
  Admin: "secondary",
  Member: "outline"
};
