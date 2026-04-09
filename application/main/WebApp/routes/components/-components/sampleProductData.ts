export interface SampleProduct {
  id: number;
  name: string;
  description: string;
  category: "Electronics" | "Clothing" | "Home" | "Sports" | "Books";
  price: number;
  status: "In stock" | "Low stock" | "Out of stock";
  addedAt: string;
}

export const sampleProducts: SampleProduct[] = [
  {
    id: 1,
    name: "Wireless headphones",
    description: "Noise-cancelling over-ear headphones",
    category: "Electronics",
    price: 249,
    status: "In stock",
    addedAt: "2025-11-12"
  },
  {
    id: 2,
    name: "Running shoes",
    description: "Lightweight trail running shoes",
    category: "Sports",
    price: 129,
    status: "In stock",
    addedAt: "2025-12-03"
  },
  {
    id: 3,
    name: "Desk lamp",
    description: "Adjustable LED desk lamp with dimmer",
    category: "Home",
    price: 59,
    status: "Low stock",
    addedAt: "2026-01-15"
  },
  {
    id: 4,
    name: "Winter jacket",
    description: "Insulated waterproof jacket",
    category: "Clothing",
    price: 199,
    status: "In stock",
    addedAt: "2026-01-22"
  },
  {
    id: 5,
    name: "Mechanical keyboard",
    description: "Compact 75% layout with hot-swap switches",
    category: "Electronics",
    price: 149,
    status: "In stock",
    addedAt: "2026-02-01"
  },
  {
    id: 6,
    name: "Yoga mat",
    description: "Non-slip natural rubber mat",
    category: "Sports",
    price: 45,
    status: "Out of stock",
    addedAt: "2026-02-10"
  },
  {
    id: 7,
    name: "Coffee table",
    description: "Solid oak with rounded edges",
    category: "Home",
    price: 349,
    status: "In stock",
    addedAt: "2026-02-18"
  },
  {
    id: 8,
    name: "Linen shirt",
    description: "Relaxed fit short-sleeve linen shirt",
    category: "Clothing",
    price: 79,
    status: "Low stock",
    addedAt: "2026-03-01"
  },
  {
    id: 9,
    name: "Design patterns",
    description: "Elements of reusable object-oriented software",
    category: "Books",
    price: 42,
    status: "In stock",
    addedAt: "2026-03-10"
  },
  {
    id: 10,
    name: "Monitor stand",
    description: "Aluminum stand with USB-C hub",
    category: "Electronics",
    price: 89,
    status: "In stock",
    addedAt: "2026-03-15"
  },
  {
    id: 11,
    name: "Hiking backpack",
    description: "40L backpack with rain cover",
    category: "Sports",
    price: 119,
    status: "Low stock",
    addedAt: "2026-03-20"
  },
  {
    id: 12,
    name: "Throw blanket",
    description: "Chunky knit wool blend blanket",
    category: "Home",
    price: 69,
    status: "In stock",
    addedAt: "2026-03-28"
  }
];

export const pageSize = 5;

export const statusVariant: Record<SampleProduct["status"], "default" | "secondary" | "outline"> = {
  "In stock": "default",
  "Low stock": "secondary",
  "Out of stock": "outline"
};
