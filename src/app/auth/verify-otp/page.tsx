"use client";

import { useSearchParams } from "next/navigation";
import VerifyOTP from "@/components/auth/VerifyOTP";

const VerifyOTPPage = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return <VerifyOTP email={email} />;
};

export default VerifyOTPPage;
