import SystemShell from "@/components/os/SystemShell";

/**
 * Shell do AdrielDev: sidebar colapsável + topbar (busca), com scroll
 * fluido. O /studio fica FORA deste grupo.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SystemShell>{children}</SystemShell>;
}
