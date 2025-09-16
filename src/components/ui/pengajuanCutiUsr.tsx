import AppBreadcrumb from "@/components/AppBreadcrumb";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarUser from "@/components/app-sidebarUser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PengajuanCutiPage = () => {
  return (
    <SidebarProvider className="font-montserrat">
      <AppSidebarUser />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default PengajuanCutiPage;
