export const trip = {
  destination: "Bali, Indonesia",
  dates: "25 June – 2 July 2024",
  days: 8,
  image:
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
};

export const budget = {
  total: 8_500_000,
  spent: 3_200_000,
  get remaining() {
    return this.total - this.spent;
  },
};

export type DayCard = {
  day: number;
  date: string;
  title: string;
  icon: string;
  image: string;
};

export const itinerary: DayCard[] = [
  {
    day: 1,
    date: "25 Jun",
    title: "Arrival in Bali & Check-in",
    icon: "✈️",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80",
  },
  {
    day: 2,
    date: "26 Jun",
    title: "Uluwatu Temple & Beach",
    icon: "🏖️",
    image:
      "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=600&q=80",
  },
  {
    day: 3,
    date: "27 Jun",
    title: "Ubud Exploration & Waterfall",
    icon: "🌊",
    image:
      "https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=600&q=80",
  },
  {
    day: 4,
    date: "28 Jun",
    title: "Canggu Day & Cafe Hopping",
    icon: "☕",
    image:
      "https://images.unsplash.com/photo-1559628233-100c798642d4?auto=format&fit=crop&w=600&q=80",
  },
  {
    day: 5,
    date: "29 Jun",
    title: "Nusa Penida Island Tour",
    icon: "📸",
    image:
      "https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&fit=crop&w=600&q=80",
  },
  {
    day: 6,
    date: "30 Jun",
    title: "Free Day & Relax",
    icon: "🌴",
    image:
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80",
  },
  {
    day: 7,
    date: "1 Jul",
    title: "Sunset Tour & Shopping",
    icon: "🌅",
    image:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=80",
  },
  {
    day: 8,
    date: "2 Jul",
    title: "Return Home",
    icon: "✈️",
    image:
      "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=600&q=80",
  },
];

export const breakdown = [
  { name: "Transportasi", value: 2_500_000, pct: 29, color: "#7CB7E8" },
  { name: "Akomodasi", value: 3_000_000, pct: 35, color: "#DFA4AF" },
  { name: "Makan", value: 1_500_000, pct: 18, color: "#93B29B" },
  { name: "Aktivitas", value: 1_000_000, pct: 12, color: "#D7B35B" },
  { name: "Lainnya", value: 500_000, pct: 6, color: "#DCEBF5" },
];

export type Activity = {
  id: string;
  time: string;
  duration: string;
  title: string;
  location: string;
  transport: string;
  priority: "High" | "Medium" | "Low";
  note?: string;
  /** Optional cost of this activity in Rupiah (blank/0 = free). */
  amount?: number;
};

export type ItineraryDay = {
  day: number;
  date: string;
  title: string;
  icon: string;
  image?: string;
  activities: Activity[];
};

export const itineraryDetail: ItineraryDay[] = [
  {
    day: 1,
    date: "25 Jun",
    title: "Arrival in Bali",
    icon: "✈️",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80",
    activities: [
      {
        id: "a1",
        time: "10:00",
        duration: "2 hours",
        title: "Land at Ngurah Rai Airport",
        location: "Denpasar",
        transport: "✈️ Flight",
        priority: "High",
        note: "Pick up SIM card & exchange money",
      },
      {
        id: "a2",
        time: "13:00",
        duration: "2 hours",
        title: "Check-in at villa",
        location: "Seminyak",
        transport: "🚗 Car",
        priority: "Medium",
      },
      {
        id: "a3",
        time: "18:30",
        duration: "2 hours",
        title: "Sunset dinner at the beach",
        location: "Seminyak Beach",
        transport: "🛵 Scooter",
        priority: "Low",
        note: "Try the grilled seafood!",
      },
    ],
  },
  {
    day: 2,
    date: "26 Jun",
    title: "Uluwatu Temple & Beach",
    icon: "🏖️",
    image:
      "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=600&q=80",
    activities: [
      {
        id: "b1",
        time: "09:00",
        duration: "2 hours",
        title: "Padang Padang Beach",
        location: "Uluwatu",
        transport: "🚗 Car",
        priority: "High",
      },
      {
        id: "b2",
        time: "16:00",
        duration: "2 hours",
        title: "Uluwatu Temple + Kecak Dance",
        location: "Uluwatu",
        transport: "🚗 Car",
        priority: "High",
        note: "Mind the cheeky monkeys 🐒",
      },
    ],
  },
  {
    day: 3,
    date: "27 Jun",
    title: "Ubud Exploration",
    icon: "🌊",
    image:
      "https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=600&q=80",
    activities: [
      {
        id: "c1",
        time: "08:00",
        duration: "2 hours",
        title: "Tegallalang Rice Terrace",
        location: "Ubud",
        transport: "🚗 Car",
        priority: "Medium",
      },
      {
        id: "c2",
        time: "11:00",
        duration: "2 hours",
        title: "Tegenungan Waterfall",
        location: "Ubud",
        transport: "🚗 Car",
        priority: "High",
      },
    ],
  },
];

export type Expense = {
  id: string;
  title: string;
  category: string;
  amount: number;
  paidBy: string;
  date: string;
  emoji: string;
};

export const expenseCategories = [
  { name: "Akomodasi", color: "#DFA4AF", emoji: "🏡" },
  { name: "Transportasi", color: "#7CB7E8", emoji: "🚗" },
  { name: "Makan", color: "#93B29B", emoji: "🍜" },
  { name: "Aktivitas", color: "#D7B35B", emoji: "🎭" },
  { name: "Lainnya", color: "#DCEBF5", emoji: "✨" },
];

export type BillItem = {
  id: string;
  name: string; // food/drink
  amount: number;
  eater: string; // traveler name
};

export type Bill = {
  id: string;
  title: string;
  bankNumber: string;
  bankName: string; // account holder name
  createdBy: string;
  date: string;
  items: BillItem[];
};

export const expenses: Expense[] = [
  {
    id: "e1",
    title: "Villa booking (3 nights)",
    category: "Akomodasi",
    amount: 1_800_000,
    paidBy: "Naya Putri",
    date: "20 Jun",
    emoji: "🏡",
  },
  {
    id: "e2",
    title: "Airport transfer",
    category: "Transportasi",
    amount: 350_000,
    paidBy: "Dimas Pratama",
    date: "25 Jun",
    emoji: "🚗",
  },
  {
    id: "e3",
    title: "Seafood dinner",
    category: "Makan",
    amount: 480_000,
    paidBy: "Naya Putri",
    date: "25 Jun",
    emoji: "🦐",
  },
  {
    id: "e4",
    title: "Uluwatu entrance + show",
    category: "Aktivitas",
    amount: 300_000,
    paidBy: "Alya Rahma",
    date: "26 Jun",
    emoji: "🎭",
  },
  {
    id: "e5",
    title: "Scooter rental",
    category: "Transportasi",
    amount: 270_000,
    paidBy: "Kevin Sanjaya",
    date: "26 Jun",
    emoji: "🛵",
  },
];

export type Note = {
  id: string;
  title: string;
  body: string;
  color: string;
  rotate: number;
};

export const notes: Note[] = [
  {
    id: "n1",
    title: "Packing list 🎒",
    body: "Sunscreen, swimwear, power bank, light clothes, flip flops, reusable bottle.",
    color: "#D7B35B",
    rotate: -3,
  },
  {
    id: "n2",
    title: "Must-try food 🍜",
    body: "Babi guling, nasi campur, sate lilit, fresh coconut, kopi luwak.",
    color: "#DFA4AF",
    rotate: 2,
  },
  {
    id: "n3",
    title: "Reminders ⏰",
    body: "Book Nusa Penida ferry early. Bring cash for small warungs.",
    color: "#93B29B",
    rotate: -2,
  },
  {
    id: "n4",
    title: "Photo spots 📸",
    body: "Kelingking Beach, Handara Gate, Lempuyang Temple gates.",
    color: "#7CB7E8",
    rotate: 3,
  },
];

export type Inspo = {
  id: string;
  place: string;
  country: string;
  image: string;
  tag: string;
};

export const inspirations: Inspo[] = [
  {
    id: "i1",
    place: "Santorini",
    country: "Greece",
    tag: "🌅 Sunsets",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "i2",
    place: "Kyoto",
    country: "Japan",
    tag: "🌸 Culture",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "i3",
    place: "Maldives",
    country: "Indian Ocean",
    tag: "🏝️ Beaches",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "i4",
    place: "Swiss Alps",
    country: "Switzerland",
    tag: "🏔️ Mountains",
    image:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "i5",
    place: "Marrakech",
    country: "Morocco",
    tag: "🕌 Markets",
    image:
      "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "i6",
    place: "Banff",
    country: "Canada",
    tag: "🍁 Lakes",
    image:
      "https://images.unsplash.com/photo-1561134643-668f9057cce4?auto=format&fit=crop&w=600&q=80",
  },
];

export type Traveler = {
  name: string;
  role: string;
  status: "You" | "Organizer" | "Paid" | "Pending" | "Invited" | "Joined";
  avatar: string;
  amountDue?: number;
};

export const travelers: Traveler[] = [
  {
    name: "Naya Putri",
    role: "Trip Planner",
    status: "You",
    avatar: "https://i.pravatar.cc/120?img=47",
  },
  {
    name: "Dimas Pratama",
    role: "Co-Organizer",
    status: "Paid",
    avatar: "https://i.pravatar.cc/120?img=12",
  },
  {
    name: "Alya Rahma",
    role: "Traveler",
    status: "Paid",
    avatar: "https://i.pravatar.cc/120?img=32",
  },
  {
    name: "Kevin Sanjaya",
    role: "Traveler",
    status: "Pending",
    avatar: "https://i.pravatar.cc/120?img=15",
  },
];
