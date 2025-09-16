import AppBreadcrumb from "@/components/AppBreadcrumb";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarUser from "@/components/app-sidebarUser";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";

const LaporanMingguanPage = () => {
  return (
    <SidebarProvider className="font-montserrat">
      <AppSidebarUser />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>
        <div className="mt-4">
          <h1 className="text-3xl font-bold mb-2">Laporan Mingguan</h1>

          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Upload Laporan</h2>
            <Label htmlFor="picture">Picture</Label>
            <Input id="picture" type="file" />
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default LaporanMingguanPage;
