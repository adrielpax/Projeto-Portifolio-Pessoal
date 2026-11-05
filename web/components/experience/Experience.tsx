"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { stage } from "@/lib/stage";
import { seg } from "@/lib/math";
import type { SectionId } from "@/lib/content";
import { agents } from "@/components/pixel/agents";
import { Agent } from "@/components/pixel/Agent";
import { HeroCard } from "./HeroCard";
import { Navbar } from "./Navbar";
import { Dock } from "./Dock";
import { Triangles } from "./Triangles";
import { Projects } from "@/components/sections/Projects";
import { Stack } from "@/components/sections/Stack";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { A11yPanel } from "@/components/A11yPanel";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Scene = dynamic(() => import("@/components/three/Scene"), { ssr: false });

const SECTION_NAMES: Record<SectionId, string> = {
  hero: "Início",
  intro: "Sobre",
  projects: "Projetos",
  stack: "Stack",
  contact: "Contato",
};

const PAPER = "#ffffff";
const DIM = "rgba(255,255,255,0.6)";

/**
 * Arquitetura:
 *  - Abertura: o card do hero fica fixo na primeira tela. Ao rolar 1 tela, uma
 *    timeline GSAP (scrub) leva a foto e os links para a navbar.
 *  - Depois disso é uma página normal, com rolagem nativa: a primeira faixa é
 *    transparente (o fundo 3D aparece) e as seguintes ficam numa superfície clara.
 *  - Efeitos de entrada das seções são CSS + IntersectionObserver (baratos).
 *  - A cena 3D para de renderizar quando sai de vista.
 */
export default function Experience() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const introRef = useRef<gsap.core.Timeline | null>(null);
  const [active, setActive] = useState<SectionId>("hero");
  const [booted, setBooted] = useState(false);
  const [layoutKey, setLayoutKey] = useState(0);
  const [sceneOn, setSceneOn] = useState(true);
  // versão leve: sem WebGL no celular ou com economia de dados ligada
  const [lite, setLite] = useState(false);

  /* ----------------------------- preparação ------------------------------ */
  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    setLite(window.innerWidth < 768 || Boolean(nav.connection?.saveData));
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!window.location.hash) window.scrollTo(0, 0);
    stage.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ScrollTrigger.config({ ignoreMobileResize: true });
    document.fonts.ready.then(() => setBooted(true));
  }, []);

  const go = useCallback((id: SectionId) => {
    const smooth = stage.reducedMotion ? "auto" : "smooth";
    if (id === "hero") {
      window.scrollTo({ top: 0, behavior: smooth });
      return;
    }
    document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: smooth, block: "start" });
  }, []);

  // reconstrói a abertura quando o layout muda de verdade; o recado dos agentes leva ao contato
  useEffect(() => {
    let w = window.innerWidth;
    let id = 0;
    const onResize = () => {
      window.clearTimeout(id);
      id = window.setTimeout(() => {
        if (window.innerWidth !== w) {
          w = window.innerWidth;
          setLayoutKey((k) => k + 1);
        }
      }, 180);
    };
    const onA11y = () => setLayoutKey((k) => k + 1);
    const onConnect = () => go("contact");
    window.addEventListener("resize", onResize);
    window.addEventListener("a11y:change", onA11y);
    window.addEventListener("agent:connect", onConnect);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("a11y:change", onA11y);
      window.removeEventListener("agent:connect", onConnect);
      window.clearTimeout(id);
    };
  }, [go]);

  // seção ativa (navbar/Dock), entrada das seções e pausa da cena 3D
  useEffect(() => {
    const ids: SectionId[] = ["projects", "stack", "contact"];
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id.replace("sec-", "") as SectionId);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(`sec-${id}`);
      if (el) spy.observe(el);
    });

    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            reveal.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => reveal.observe(el));

    const onScroll = () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 0.5) setActive("hero");
      const visible = y < window.innerHeight * 2.4;
      stage.sceneVisible = visible;
      setSceneOn(visible);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      spy.disconnect();
      reveal.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* ---------------- abertura: card → navbar (1 tela de rolagem) ---------------- */
  useGSAP(
    () => {
      if (!booted || !root.current || !track.current) return;
      const q = gsap.utils.selector(root);
      const one = (sel: string) => q(sel)[0] as HTMLElement;
      const rect = (el: Element) => el.getBoundingClientRect();

      const tilt = one(".tilt");
      tilt.style.transform = "";
      const avatar = one(".hero-avatar");
      const navAvatar = one(".nav-avatar-slot");
      const avR = rect(avatar);
      const navAvR = rect(navAvatar);
      const heroLinks = q(".hero-link") as HTMLElement[];
      const navSlots = q(".nav-slot") as HTMLElement[];

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: track.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
        onUpdate: () => {
          stage.t = tl.progress();
          if (stage.t > 0.001 && introRef.current?.isActive()) introRef.current.progress(1);
        },
      });

      tl.to(".scroll-hint", { autoAlpha: 0, duration: 0.1 }, 0);
      tl.to(".hero-copy", { autoAlpha: 0, y: -24, duration: 0.3 }, 0.02);
      tl.to(".hero-socials", { autoAlpha: 0, duration: 0.2 }, 0.02);
      tl.to(".hero-links-rule", { scaleX: 0, duration: 0.2 }, 0.02);
      tl.to(".hero-photo", { autoAlpha: 0, duration: 0.3 }, 0.05);
      tl.to(".hero-card-bg", { autoAlpha: 0, duration: 0.3 }, 0.15);

      // o recorte do rosto voa até a navbar
      tl.set(avatar, { autoAlpha: 1 }, 0.08);
      tl.to(
        avatar,
        { x: navAvR.left - avR.left, y: navAvR.top - avR.top, scale: navAvR.width / avR.width, duration: 0.55, ease: "power3.inOut" },
        0.08,
      );
      // links do card → links da navbar
      heroLinks.forEach((el, i) => {
        const a = rect(el);
        const b = rect(navSlots[i]);
        tl.to(el, { x: b.left - a.left, y: b.top - a.top, color: i === 0 ? PAPER : DIM, duration: 0.55, ease: "power3.inOut" }, 0.1 + i * 0.03);
      });
      // troca invisível: quem voou some, a navbar assume
      tl.set([avatar, ...heroLinks], { autoAlpha: 0 }, 0.72);
      tl.set([navAvatar, ...navSlots], { autoAlpha: 1 }, 0.72);
      tl.fromTo(".nav-chrome", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, 0.55);
      tl.set(".hero-stage", { autoAlpha: 0 }, 0.98);

      const bar = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const el = q(".nav-progress")[0] as HTMLElement | undefined;
        if (el) el.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      };
      window.addEventListener("scroll", bar, { passive: true });
      bar();
      return () => window.removeEventListener("scroll", bar);
    },
    { scope: root, dependencies: [booted, layoutKey], revertOnUpdate: true },
  );

  /* ----------------------- entrada da página --------------------------- */
  useGSAP(
    () => {
      if (!booted || stage.reducedMotion) return;
      const intro = gsap.timeline({ delay: 0.1 });
      introRef.current = intro;
      intro.fromTo(
        ".hero-card-bg",
        { clipPath: "inset(50% 0% 50% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "expo.inOut", clearProps: "clipPath" },
      );
      intro.from(".tilt .intro", { autoAlpha: 0, duration: 0.5, stagger: 0.05 }, 0.25);
      intro.from(".agent-intro", { autoAlpha: 0, scale: 0.4, duration: 0.6, stagger: 0.1, ease: "back.out(2)" }, 0.5);
    },
    { scope: root, dependencies: [booted] },
  );

  /* ------------------ inclinação do card com o mouse (só no hero) ---------- */
  useEffect(() => {
    const tilt = root.current?.querySelector<HTMLElement>(".tilt");
    let cx = 0;
    let cy = 0;
    const onMove = (e: PointerEvent) => {
      stage.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      stage.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
      document.documentElement.style.setProperty("--mx", `${e.clientX}px`);
      document.documentElement.style.setProperty("--my", `${e.clientY}px`);
    };
    const tick = () => {
      if (!tilt) return;
      const f = stage.reducedMotion ? 0 : 1 - seg(stage.t, 0, 0.06);
      if (f <= 0) {
        if (cx !== 0 || cy !== 0) {
          cx = cy = 0;
          tilt.style.transform = "";
        }
        return;
      }
      cx += (stage.mouseX * 5 * f - cx) * 0.08;
      cy += (stage.mouseY * 4 * f - cy) * 0.08;
      tilt.style.transform = `rotateY(${cx.toFixed(3)}deg) rotateX(${(-cy).toFixed(3)}deg)`;
    };
    window.addEventListener("pointermove", onMove);
    gsap.ticker.add(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      gsap.ticker.remove(tick);
    };
  }, []);

  return (
    <div ref={root} className="relative">
      <a
        href="#sec-projects"
        className="glass glass-dark glass-pill fixed left-3 top-3 z-[70] -translate-y-24 px-4 py-2 text-[14px] font-medium text-white focus:translate-y-0"
      >
        Pular para o conteúdo
      </a>

      {/* fundo fixo: grafo 3D (ou estático), vinheta e triângulos */}
      <div className="fixed inset-0 z-0 bg-black" aria-hidden>
        {lite ? <div className="lite-bg absolute inset-0" /> : <Scene active={sceneOn} />}
        <div className="vignette pointer-events-none absolute inset-0" />
        <Triangles />
      </div>

      {/* abertura: card fixo que vira navbar */}
      <div className="hero-stage pointer-events-none fixed inset-0 z-20 [perspective:1400px]">
        <div className="tilt absolute inset-0 flex items-center justify-center">
          <HeroCard go={go} />
        </div>
        <div className="scroll-hint absolute bottom-8 left-1/2 -translate-x-1/2 text-[14px] text-white/60">Role para continuar</div>
      </div>

      {/* 1 tela de rolagem para a abertura acontecer */}
      <div ref={track} className="h-[100svh]" aria-hidden />

      <main className="relative z-30">
        <Projects />
        <Stack />
        <Contact />
        <Footer />
      </main>

      {/* agentes soltos pela tela */}
      <div className="agents-layer pointer-events-none fixed inset-0 z-40">
        {agents.map((a) => (
          <Agent key={a.id} def={a} />
        ))}
      </div>

      <Navbar active={active} go={go} />
      <Dock active={active} go={go} />
      <A11yPanel />

      <p className="sr-only" aria-live="polite">
        Seção atual: {SECTION_NAMES[active]}
      </p>
    </div>
  );
}
