export interface AbsenData {
  jamDatang: string;
  jamKeluar: string;
  tanggal: string;
  lokasi?: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  ipAddress?: string; 
  wifiName?: string;
}
