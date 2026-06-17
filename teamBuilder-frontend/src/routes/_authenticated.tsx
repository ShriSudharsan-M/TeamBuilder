import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/auth-store";
import { AppSidebar } from "@/components/app-sidebar";
import { LuminousArcs } from "@/components/luminous-arcs";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    const { token } = useAuthStore.getState();
    if (!token) {
      throw redirect({
        to: "/auth/login",
        search: { redirect: location.href },
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <div className="relative flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="relative min-w-0 flex-1">
        <LuminousArcs variant="ambient" className="opacity-60" />
        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 py-8 lg:px-12 lg:py-12">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
