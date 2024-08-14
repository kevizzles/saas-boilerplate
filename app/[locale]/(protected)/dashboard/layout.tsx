import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/lucia";
import { SessionProvider } from "@/providers/SessionProvider";
import { QuotaProvider } from "@/providers/QuotaProvider";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/sign-in");
  }
  return <QuotaProvider>{children}</QuotaProvider>;
}