// TODO: Buat komponen PengajuanCuti di folder components
// import PengajuanCuti from "@/components/pengajuanCuti";

import AppBreadcrumb from "@/components/AppBreadcrumb";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarUser from "@/components/app-sidebarUser";

const PengajuanCutiPage = () => {
  return (
    <SidebarProvider className="font-montserrat">
      <AppSidebarUser />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <SidebarTrigger />
          <AppBreadcrumb />
        </div>
        <div className="mt-4">
          <h1 className="text-3xl font-bold mb-2">Pengajuan Cuti</h1>
          <p>Ajukan permohonan cuti Anda</p>

          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Form Pengajuan Cuti</h2>
            <p className="text-gray-600">
              Silakan buat komponen pengajuanCuti.tsx di folder components...
            </p>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default PengajuanCutiPage;
