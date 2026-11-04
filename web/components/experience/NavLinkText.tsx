/** mesmo visual no card e na navbar: é isso que permite a troca invisível */
export function NavLinkText({ label }: { index?: string; label: string }) {
  return <>{label}</>;
}

export const navLinkClass = "inline-flex items-center whitespace-nowrap text-[15px] font-medium leading-none md:text-[16px]";
