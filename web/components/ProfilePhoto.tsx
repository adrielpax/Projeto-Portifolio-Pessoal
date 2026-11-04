import { profile } from "@/lib/content";

/** foto de perfil redonda, recortada no rosto (profile.avatarCrop) */
export function ProfilePhoto({ className = "", alt = `Foto de ${profile.name}` }: { className?: string; alt?: string }) {
  const c = profile.avatarCrop;
  return (
    <div className={`relative overflow-hidden rounded-full bg-faint ring-1 ring-white/25 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={profile.avatar}
        alt={alt}
        className="absolute max-w-none select-none"
        draggable={false}
        style={{ width: `${100 / c.size}%`, left: `${(-c.x / c.size) * 100}%`, top: `${(-c.y / c.size) * 100}%` }}
      />
    </div>
  );
}
