import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { BotonRecalcular } from "./componentes/BotonRecalcular";
import { sello } from "../lib/vista";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vigía · Priorización de medicamentos",
  description: "Sistema de priorización de reposición de medicamentos hospitalarios",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Render por request en todas las rutas: la CSP con nonce de proxy.ts no llega a páginas estáticas
  await connection();

  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-papel px-5 pb-16 text-tinta">
        <div className="mx-auto max-w-[1300px]">
          <header className="flex flex-wrap items-end justify-between gap-5 border-b-2 border-tinta pt-[26px] pb-3.5">
            <div className="flex flex-wrap items-baseline gap-4">
              <Link href="/" className="font-sans text-[22px] leading-none font-semibold tracking-[.28em]">
                VIGÍA
              </Link>
              <span className="font-mono text-xs leading-snug tracking-[.04em] text-gris">
                Priorización de reabastecimiento · Farmacia central
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-[18px]">
              <span className="font-mono text-[11px] leading-snug text-gris">ÚLTIMO CÁLCULO {sello(new Date())}</span>
              <BotonRecalcular />
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
