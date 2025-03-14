import { ScrollArea } from "@/components/ui/scroll-area";
import { AppSidebarWrapper } from "@/components/app-sidebar-wrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppSidebarWrapper>
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </ScrollArea>
      </main>
    </AppSidebarWrapper>
  );
} 