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
    <div className={cn("border-b", className)}>
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
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground",
                "group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium transition-colors"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 