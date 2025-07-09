// app/admin/chartSetup.tsx
"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement, // ⬅️  NEW
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement, // ⬅️  NEW
  Title,
  Tooltip,
  Legend
);

export default function ChartSetup() {
  return null; // registers once, renders nothing
}
