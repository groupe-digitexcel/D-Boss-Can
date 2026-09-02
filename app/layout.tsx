import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'D-BOSS MOTOS | Candidate Pilot', description: 'Driver recruitment and preliminary screening pilot.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="fr"><body>{children}</body></html>; }
