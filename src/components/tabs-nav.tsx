"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Tab {
  name: string;
  href: string;
}

interface TabsNavProps {
  tabs: Tab[];
  className?: string;
}

export function TabsNav({ tabs, className }: TabsNavProps) {
  const pathname = usePathname();

  return (
    <div className={cn("border-b border-gray-800", className)}>
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || 
                          (pathname.startsWith(tab.href) && tab.href !== "/dashboard");
          
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                isActive
                  ? "border-[#00C6FF] text-[#00C6FF]"
                  : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-white",
                "group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium transition-all duration-300 relative"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-[#3949AB] to-[#00C6FF]" />
              )}
              {tab.name}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#00C6FF]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 