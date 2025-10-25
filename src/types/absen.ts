export interface AbsenData {
  jamDatang: string;
  jamKeluar: string;
  tanggal: string | null;
  lokasi?: string;
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  ipAddress?: string | null;
  wifiName?: string | null;     
  checkinStatus?: string;
  checkoutStatus?: string;
  detected?: string[];
  clientIp?: string | null;
}
