import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "primereact/resources/themes/lara-light-green/theme.css";
import "primeicons/primeicons.css";
import { PrimeReactProvider } from "primereact/api";
import QueryProvider from "@/providers/query-provider";
import Nprogressprovider from "@/providers/n-progress-provider";
import { Toaster } from "@/components/ui";
import GlobalLoader from "@/components/layout/global-loader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sewage Ledger System",
  description: "Sewage Ledger Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PrimeReactProvider value={{ unstyled: false }}>
          <QueryProvider>
            <Nprogressprovider>
              <GlobalLoader />
              {children}
              <Toaster />
            </Nprogressprovider>
          </QueryProvider>
        </PrimeReactProvider>
      </body>
    </html>
  );
}
