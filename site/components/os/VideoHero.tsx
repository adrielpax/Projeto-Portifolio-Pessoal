"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Play } from "lucide-react";

import Magnetic from "./Magnetic";
import JarvisCore from "./JarvisCore";

export type HeroStats = {
  projetos: number;
  live: number;
  stack: number;
  certs: number;
};

/**
 * Hero cinematográfico escuro.
 * Fundo: mesh gradient animado + grão (0 KB). Se você adicionar um vídeo em
 * public/videos/hero.mp4, ele é usado no lugar do mesh automaticamente.
 */
/** Defina NEXT_PUBLIC_HERO_VIDEO (ex: "/videos/hero.mp4") para usar vídeo. */
const VIDEO_URL = process.env.NEXT_PUBLIC_HERO_VIDEO;

export default function VideoHero({ stats }: { stats?: HeroStats }) {
  const [videoOk, setVideoOk] = useState(true);
  const ref = useRef<HTMLElement>(null);

  // Parallax suave do fundo conforme o scroll
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="hud-grain hud-scanline relative h-[56vh] min-h-[380px] w-full overflow-hidden md:h-[66vh] md:min-h-[480px]"
    >
      {/* Mesh gradient animado */}
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <div className="hud-aurora absolute inset-[-12%]">
          <span
            className="left-[6%] top-[12%] h-[26rem] w-[26rem]"
            style={{ "--blob": "rgba(34,211,238,0.28)" } as React.CSSProperties}
          />
          <span
            className="right-[4%] top-[4%] h-[30rem] w-[30rem]"
            style={{ "--blob": "rgba(0,245,255,0.14)", animationDelay: "3s" } as React.CSSProperties}
          />
          <span
            className="bottom-[2%] left-[28%] h-[32rem] w-[32rem]"
            style={{ "--blob": "rgba(8,145,178,0.24)", animationDelay: "7s" } as React.CSSProperties}
          />
        </div>

        {/* Vídeo de fundo opcional.
            Só é renderizado quando NEXT_PUBLIC_HERO_VIDEO aponta para um
            arquivo — antes, o hero pedia um vídeo inexistente e gerava um 404
            em toda visita. */}
        {VIDEO_URL && videoOk && (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            onError={() => setVideoOk(false)}
          >
            <source src={VIDEO_URL} type="video/mp4" />
          </video>
        )}
      </motion.div>

      {/* Camadas de leitura (escuras) */}
      <div className="absolute inset-0 hud-grid opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-t from-hud-bg via-hud-bg/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-hud-bg/85 via-hud-bg/30 to-transparent" />

      {/* Núcleo Jarvis — reator de dados (telas grandes) */}
      {stats && (
        <motion.div
          style={{ opacity: fade }}
          className="absolute right-10 top-1/2 z-10 hidden -translate-y-1/2 lg:block xl:right-16"
        >
          <JarvisCore stats={stats} />
        </motion.div>
      )}

      {/* Conteúdo */}
      <motion.div
        style={{ y: contentY, opacity: fade }}
        className="relative z-10 flex h-full flex-col justify-end p-5 pb-8 sm:p-6 md:p-12 lg:p-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <span className="hud-label mb-3 flex items-center gap-2">
            <span className="h-px w-7 shrink-0 bg-hud-detail" />
            <span className="truncate">
              Adriel Silva — Full-Stack
              <span className="hidden sm:inline"> · Automação · IA aplicada</span>
            </span>
          </span>

          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-hud-text md:text-6xl">
            Construo <span className="text-silver">sistemas</span> que
            <br className="hidden md:block" /> escalam negócios.
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-hud-muted md:text-base">
            SaaS, automações e IA aplicada — do primeiro deploy à operação.
            Tudo aqui está em produção: abra, teste e explore os bastidores no blog.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Magnetic className="inline-block">
              <Link
                href="/projetos"
                className="btn-primary px-6 py-3.5 font-display text-sm font-semibold tracking-wide"
              >
                <Play className="h-4 w-4 fill-current" /> Explorar projetos
              </Link>
            </Magnetic>
            <Link
              href="/blog"
              className="btn-ghost px-6 py-3.5 font-display text-sm font-medium tracking-wide"
            >
              Bastidores no blog <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
