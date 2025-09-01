// TODO: Buat komponen RiwayatCuti di folder components
// import RiwayatCuti from "@/components/riwayatCuti";

import AppBreadcrumb from "@/components/AppBreadcrumb";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarUser from "@/components/app-sidebarUser";

const RiwayatCutiPage = () => {
  return (
    <SidebarProvider className="font-montserrat">
      <AppSidebarUser />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>
        <div className="mt-4">
          <h1 className="text-3xl font-bold mb-2">Riwayat Cuti</h1>
          <p>Lihat riwayat pengajuan cuti Anda</p>

          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Data Riwayat Cuti</h2>
            <p className="text-gray-600">
              Silakan buat komponen riwayatCuti.tsx di folder components...
            </p>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default RiwayatCutiPage;
