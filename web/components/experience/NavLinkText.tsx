/** mesmo visual no card e na navbar: é isso que permite a troca invisível */
export function NavLinkText({ index, label }: { index: string; label: string }) {
  return (
    <>
      <span className="mr-1.5 hidden text-dim md:inline">{index}</span>
      {label}
    </>
  );
}

export const navLinkClass =
  "inline-flex items-center whitespace-nowrap font-pixel text-[10px] uppercase leading-none tracking-[0.16em] md:text-[11px]";
