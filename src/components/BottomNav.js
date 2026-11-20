"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "الرئيسية", icon: "🏠" },
  { href: "/patient", label: "المريض", icon: "❤️" },
  { href: "/pro", label: "المحترف", icon: "Rx" },
  { href: "/calculators", label: "الحاسبات", icon: "Σ" },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      <div className="max-w-lg mx-auto flex justify-around">
        {LINKS.map((l) => {
          const active = path === l.href;
          return (
            <Link key={l.href} href={l.href}
              className={`flex-1 flex flex-col items-center py-2.5 transition ${active ? "text-teal-700" : "text-slate-400"}`}>
              <span className="text-xl mb-0.5">{l.icon}</span>
              <span className={`text-[11px] font-semibold ${active ? "font-bold" : ""}`}>{l.label}</span>
              {active && <span className="w-1 h-1 rounded-full bg-teal-700 mt-0.5"></span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
