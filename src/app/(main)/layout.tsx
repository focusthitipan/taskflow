import { SessionProvider } from "@/components/layout/session-provider";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MainContent } from "@/components/layout/main-content";
import { PageTransition } from "@/components/layout/page-transition";
import { ProfileProvider } from "@/components/layout/profile-context";
import { WorkspaceProvider } from "@/components/layout/workspace-context";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProfileProvider>
        <WorkspaceProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-brand-50 dark:bg-navy-900">
            <Sidebar />
            <MainContent>
              <Topbar />
              <main className="pt-[100px] sm:pt-[120px] md:pt-[130px] px-3 sm:px-5 md:px-8 pb-8">
                <PageTransition>{children}</PageTransition>
              </main>
            </MainContent>
          </div>
        </SidebarProvider>
        </WorkspaceProvider>
      </ProfileProvider>
    </SessionProvider>
  );
}
