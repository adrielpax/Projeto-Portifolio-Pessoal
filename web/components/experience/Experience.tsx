"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { stage, TIMELINE_UNITS } from "@/lib/stage";
import { seg } from "@/lib/math";
import { timelineLabels, type SectionId } from "@/lib/content";
import { agents, type Pose } from "@/components/pixel/agents";
import { Agent } from "@/components/pixel/Agent";
import { HeroCard } from "./HeroCard";
import { Navbar } from "./Navbar";
import { Dock } from "./Dock";
import { Triangles } from "./Triangles";
import { Projects } from "@/components/sections/Projects";
import { Stack } from "@/components/sections/Stack";
import { Blog } from "@/components/sections/Blog";
import { Contact } from "@/components/sections/Contact";
import { A11yPanel } from "@/components/A11yPanel";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Scene = dynamic(() => import("@/components/three/Scene"), { ssr: false });

const SECTION_NAMES: Record<SectionId, string> = {
  hero: "Início",
  projects: "Projetos",
  stack: "Stack",
  blog: "Log",
  contact: "Contato",
};

const ORDER: SectionId[] = ["hero", "projects", "stack", "blog", "contact"];
const prevSection = (s: SectionId) => ORDER[Math.max(0, ORDER.indexOf(s) - 1)];

const PAPER = "#ffffff";
const DIM = "#8c8c8c";

/**
 * Arquitetura:
 *  - um "palco" fixo (position: fixed) com 4 camadas: cena 3D, seções, agentes e navbar;
 *  - um trilho alto (.track) que só existe para gerar scroll nativo;
 *  - UMA timeline GSAP com rótulos (hero → projects → stack → stack-open → blog → contact)
 *    ligada ao scroll via ScrollTrigger com scrub + snap por rótulo.
 *  Cada "rolada" leva à próxima parada, e tudo que aparece é função do tempo da timeline.
 *  A cena 3D lê o mesmo tempo (stage.t), então DOM e WebGL ficam sincronizados.
 */
export default function Experience() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const introRef = useRef<gsap.core.Timeline | null>(null);
  const activeRef = useRef<SectionId>("hero");
  const [active, setActive] = useState<SectionId>("hero");
  const [booted, setBooted] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [layoutKey, setLayoutKey] = useState(0);

  /* ----------------------------- preparação ------------------------------ */
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    stage.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ScrollTrigger.config({ ignoreMobileResize: true });
    document.fonts.ready.then(() => {
      setFontsReady(true);
      setBooted(true);
    });
  }, []);

  // reconstrói a timeline quando o layout muda de verdade (ignora a barra do navegador mobile)
  useEffect(() => {
    let w = window.innerWidth;
    let h = window.innerHeight;
    let id = 0;
    const onResize = () => {
      window.clearTimeout(id);
      id = window.setTimeout(() => {
        if (window.innerWidth !== w || Math.abs(window.innerHeight - h) > 120) {
          w = window.innerWidth;
          h = window.innerHeight;
          setLayoutKey((k) => k + 1);
        }
      }, 180);
    };
    const onA11y = () => setLayoutKey((k) => k + 1);
    const onConnect = () => go("contact");
    window.addEventListener("agent:connect", onConnect);
    window.addEventListener("resize", onResize);
    window.addEventListener("a11y:change", onA11y);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("a11y:change", onA11y);
      window.removeEventListener("agent:connect", onConnect);
      window.clearTimeout(id);
    };
  }, []);

  const go = useCallback((id: SectionId) => {
    const st = tlRef.current?.scrollTrigger;
    if (!st) return;
    window.scrollTo({ top: st.labelToScroll(id), behavior: stage.reducedMotion ? "auto" : "smooth" });
  }, []);

  /* --------------------------- timeline mestre ---------------------------- */
  useGSAP(
    () => {
      if (!fontsReady || !root.current || !track.current) return;
      const q = gsap.utils.selector(root);
      const one = (sel: string) => q(sel)[0] as HTMLElement;
      const rect = (el: Element) => el.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;

      // mede tudo sem a inclinação do card
      const tilt = one(".tilt");
      tilt.style.transform = "";

      const card = rect(one(".hero-card"));
      const target = rect(one(".frame-target"));
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
          end: "bottom bottom",
          scrub: 0.9,
          snap: {
            snapTo: "labelsDirectional",
            inertia: false,
            duration: { min: 0.3, max: 0.9 },
            delay: 0.06,
            ease: "power2.inOut",
          },
        },
        onUpdate: () => {
          stage.t = tl.time();
          // se a pessoa rolar durante a entrada, a entrada termina na hora
          if (stage.t > 0.001 && introRef.current?.isActive()) introRef.current.progress(1);
          const idx = Math.min(timelineLabels.length - 1, Math.round(stage.t));
          const sec = timelineLabels[idx].section;
          if (sec !== activeRef.current) {
            activeRef.current = sec;
            setActive(sec);
          }
          const bar = q(".nav-progress")[0] as HTMLElement | undefined;
          if (bar) bar.style.transform = `scaleX(${tl.progress()})`;
        },
      });
      tl.to({}, { duration: TIMELINE_UNITS }, 0); // fixa a duração em 5 unidades
      timelineLabels.forEach((l, i) => tl.addLabel(l.label, i));

      /* ---- 0 → 1: o card vira navbar + moldura da seção de projetos ---- */
      tl.to(".scroll-hint", { autoAlpha: 0, duration: 0.12 }, 0);
      tl.to(".hero-copy", { autoAlpha: 0, y: -24, filter: "blur(8px)", duration: 0.28, ease: "power1.in" }, 0.03);
      tl.to(".hero-socials", { autoAlpha: 0, y: 12, duration: 0.2 }, 0.03);
      tl.to(".hero-links-rule", { scaleX: 0, duration: 0.2 }, 0.03);
      tl.set(".hero-card", { pointerEvents: "none" }, 0.08);

      // a foto do card se apaga e o recorte do rosto voa até a navbar
      tl.to(".hero-photo", { autoAlpha: 0, duration: 0.3 }, 0.06);
      tl.set(avatar, { autoAlpha: 1 }, 0.1);
      tl.to(
        avatar,
        {
          x: navAvR.left - avR.left,
          y: navAvR.top - avR.top,
          scale: navAvR.width / avR.width,
          duration: 0.56,
          ease: "power3.inOut",
        },
        0.1,
      );
      // links do card → links da navbar
      heroLinks.forEach((el, i) => {
        const a = rect(el);
        const b = rect(navSlots[i]);
        tl.to(
          el,
          { x: b.left - a.left, y: b.top - a.top, color: i === 0 ? PAPER : DIM, duration: 0.56, ease: "power3.inOut" },
          0.12 + i * 0.03,
        );
      });
      // troca invisível: quem voou some, a navbar assume
      tl.set([avatar, ...heroLinks], { autoAlpha: 0 }, 0.76);
      tl.set([navAvatar, ...navSlots], { autoAlpha: 1 }, 0.76);
      tl.fromTo(".nav-chrome", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.24 }, 0.62);

      // o fundo do card vira a moldura, que cresce até ocupar a tela
      tl.set(".hero-card-bg", { autoAlpha: 0 }, 0.1);
      tl.set(".frame", { autoAlpha: 1 }, 0.1);
      tl.fromTo(
        ".frame",
        { left: card.left, top: card.top, width: card.width, height: card.height },
        { left: target.left, top: target.top, width: target.width, height: target.height, duration: 0.56, ease: "power3.inOut" },
        0.14,
      );
      tl.to(".frame-bg", { opacity: 0.85, duration: 0.4 }, 0.3);

      // seções só trocam por fade: o único movimento "de palco" é o card virando navbar
      const reveal = (sec: string, at: number) => {
        tl.fromTo(sec, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, at);
      };
      const conceal = (sec: string, at: number) => {
        tl.to(sec, { autoAlpha: 0, duration: 0.25, ease: "power1.in" }, at);
      };

      reveal(".sec-projects", 0.56);

      /* ---- 1 → 2: projetos saem, equipamento entra ---- */
      conceal(".sec-projects", 1.04);
      tl.to(".frame-bg", { opacity: 0.12, duration: 0.3 }, 1.1);
      reveal(".sec-stack", 1.5);

      /* ---- 2 → 3: equipamento desmonta (na cena 3D) e a legenda aparece ---- */
      tl.to(".stack-hint", { autoAlpha: 0, y: -10, duration: 0.2 }, 2.04);
      // no celular o texto sai para o equipamento desmontado caber
      if (isMobile) tl.to(".stack-desc", { autoAlpha: 0, y: -10, duration: 0.2 }, 2.04);
      tl.fromTo(".stack-legend", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 2.4);

      /* ---- 3 → 4: blog ---- */
      conceal(".sec-stack", 3.04);
      tl.to(".frame-bg", { opacity: 0.88, duration: 0.3 }, 3.2);
      reveal(".sec-blog", 3.5);

      /* ---- 4 → 5: contato ---- */
      conceal(".sec-blog", 4.04);
      tl.to(".frame-bg", { opacity: 0.6, duration: 0.3 }, 4.2);
      reveal(".sec-contact", 4.5);

      /* ---- agentes flutuam até a pose de cada parada ---- */
      const poseVars = ([x, y, s, o]: Pose) => ({ x: `${x}vw`, y: `${y}vh`, scale: s, autoAlpha: o });
      agents.forEach((a) => {
        const el = q(`.agent-pos[data-agent="${a.id}"]`)[0];
        if (!el) return;
        const poses = isMobile ? a.poses.mobile : a.poses.desktop;
        gsap.set(el, { transformOrigin: "0 0", ...poseVars(poses[0]) });
        for (let i = 1; i < poses.length; i++) {
          tl.to(el, { ...poseVars(poses[i]), duration: 0.8, ease: "power2.inOut" }, i - 1 + 0.12);
        }
      });

      tlRef.current = tl;
      if (process.env.NODE_ENV !== "production") (window as unknown as { __tl: gsap.core.Timeline }).__tl = tl;

      // links do tipo /#blog vindos da página /links
      const hash = window.location.hash.replace("#", "") as SectionId;
      if (hash && timelineLabels.some((l) => l.label === hash)) {
        requestAnimationFrame(() => window.scrollTo({ top: tl.scrollTrigger?.labelToScroll(hash) ?? 0 }));
      }
    },
    { scope: root, dependencies: [fontsReady, layoutKey], revertOnUpdate: true },
  );

  /* ----------------------- entrada após o boot --------------------------- */
  useGSAP(
    () => {
      if (!booted) return;
      if (stage.reducedMotion) return;
      const intro = gsap.timeline({ delay: 0.15 });
      introRef.current = intro;
      intro.fromTo(
        ".hero-card-bg",
        { clipPath: "inset(50% 0% 50% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "expo.inOut", clearProps: "clipPath" },
      );
      intro.from(".tilt .intro", { autoAlpha: 0, duration: 0.6, stagger: 0.06, ease: "power1.out" }, 0.3);
      intro.from(".agent-intro", { autoAlpha: 0, scale: 0.4, duration: 0.6, stagger: 0.08, ease: "back.out(2)" }, 0.6);
      intro.from(".scroll-hint .intro", { autoAlpha: 0, duration: 0.4 }, 0.9);
    },
    { scope: root, dependencies: [booted] },
  );

  /* ------------------ mouse: parallax dos agentes e tilt do card ---------- */
  useGSAP(
    () => {
      const pars = gsap.utils.toArray<HTMLElement>(".agent-par");
      const movers = pars.map((el, i) => ({
        x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3" }),
        y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3" }),
        depth: 10 + (i % 3) * 9,
      }));
      const tilt = root.current?.querySelector<HTMLElement>(".tilt");
      let cx = 0;
      let cy = 0;
      const onMove = (e: PointerEvent) => {
        stage.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        stage.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
        document.documentElement.style.setProperty("--mx", `${e.clientX}px`);
        document.documentElement.style.setProperty("--my", `${e.clientY}px`);
        if (stage.reducedMotion || e.pointerType !== "mouse") return;
        movers.forEach((m) => {
          m.x(-stage.mouseX * m.depth);
          m.y(-stage.mouseY * m.depth);
        });
      };
      // a inclinação some antes do avatar começar a voar (t > 0.08)
      const tick = () => {
        if (!tilt) return;
        const f = stage.reducedMotion ? 0 : 1 - seg(stage.t, 0, 0.08);
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
    },
    { scope: root },
  );


  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => {
          go("projects");
          window.setTimeout(() => document.getElementById("projects-title")?.focus(), 900);
        }}
        className="glass glass-pill fixed left-3 top-3 z-[70] -translate-y-24 px-4 py-2 text-[14px] font-medium focus:translate-y-0"
      >
        Pular para o conteúdo
      </button>

      {/* trilho que gera o scroll: 1 viewport por parada */}
      <div ref={track} className="track" style={{ height: `${(TIMELINE_UNITS + 1) * 100}vh` }} aria-hidden />

      <div className="fixed inset-0 overflow-hidden">
        {/* camada 0: cena 3D */}
        <div className="absolute inset-0 z-0" aria-hidden>
          <Scene />
        </div>
        <div className="vignette pointer-events-none absolute inset-0 z-[1]" />
        <div className="absolute inset-0 z-[2]">
          <Triangles />
        </div>

        {/* camada 1: card do hero (vira moldura) + seções */}
        <div className="pointer-events-none absolute inset-0 z-20 [perspective:1400px]">
          <div className="frame-target frame-inset invisible" aria-hidden />
          <div className="tilt absolute inset-0 flex items-center justify-center">
            <div className="frame invisible absolute left-0 top-0 opacity-0">
              <div className="frame-bg glass absolute inset-0" />
              <div className="frame-outline absolute inset-0" />
              {/* barra de título de janela do macOS */}
              <div className="nav-chrome window-bar invisible pointer-events-auto absolute inset-x-0 top-0 flex h-11 items-center px-4 opacity-0">
                <div className="flex gap-2">
                  <button type="button" className="traffic bg-[#ff5f57]" onClick={() => go("hero")} aria-label="Fechar janela e voltar ao início" />
                  <button type="button" className="traffic bg-[#febc2e]" onClick={() => go(prevSection(active))} aria-label="Minimizar e voltar à seção anterior" />
                  <button
                    type="button"
                    className="traffic bg-[#28c840]"
                    onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.())}
                    aria-label="Tela cheia"
                  />
                </div>
                <p className="absolute left-1/2 -translate-x-1/2 text-[13px] font-medium text-paper/70">
                  {SECTION_NAMES[active]} <span className="text-dim">— Adriel Lucas</span>
                </p>
              </div>
            </div>
            <HeroCard go={go} />
          </div>
          <Projects />
          <Stack />
          <Blog />
          <Contact />
        </div>

        {/* camada 2: agentes em pixel art */}
        <div className="agents-layer pointer-events-none absolute inset-0 z-30">
          {agents.map((a) => (
            <Agent key={a.id} def={a} />
          ))}
        </div>

        <div className="scroll-hint pointer-events-none absolute bottom-[60px] left-1/2 z-30 -translate-x-1/2 text-[14px] text-dim md:bottom-[72px]">
          <div className="intro">Role para ver os projetos</div>
        </div>
      </div>

      <Navbar active={active} go={go} />
      <Dock active={active} go={go} />
      <A11yPanel />

      {/* leitores de tela: avisa a seção atual a cada parada do scroll */}
      <p className="sr-only" aria-live="polite">
        Seção atual: {SECTION_NAMES[active]}
      </p>
    </div>
  );
}
