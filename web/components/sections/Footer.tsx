import { profile } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-concrete-2 py-8 pb-28 text-[14px] text-slate md:pb-10">
      <div className="container-page flex flex-wrap items-center justify-between gap-3">
        <span className="font-display text-[18px] font-semibold uppercase text-graphite">{profile.name}</span>
        <span>
          {profile.location}. © {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
