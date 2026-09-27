import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import { resolveImage } from "@/lib/sanity/data";
import type { PortableContent } from "@/lib/sanity/types";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="my-4 text-[15px] leading-7 text-hud-text/85">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-10 mb-3 font-display text-2xl font-bold tracking-tight text-hud-text">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-2 font-display text-xl font-semibold tracking-tight text-hud-text">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 rounded-r-lg border-l-2 border-hud-accent bg-hud-surface/60 py-2 pl-4 italic text-hud-muted">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-hud-text">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-hud-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-hud-accent">
        {children}
      </code>
    ),
    link: ({ children, value }) => {
      const href: string = value?.href ?? "#";
      // Links internos (ex.: /jogo) continuam no site; externos abrem em nova aba.
      const externo = /^https?:\/\//.test(href);
      return (
        <Link
          href={href}
          {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="text-hud-accent underline underline-offset-2 hover:opacity-80"
        >
          {children}
        </Link>
      );
    },
  },
  types: {
    code: ({ value }) => {
      const code: string = value?.code ?? "";
      const language: string = value?.language ?? "text";
      const filename: string | undefined = value?.filename;
      return (
        <figure className="my-5 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-sm">
          <figcaption className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2">
            <span className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
            </span>
            <span className="ml-1 text-[11px] font-medium text-zinc-400">
              {filename || language}
            </span>
          </figcaption>
          <pre className="overflow-x-auto px-4 py-3.5 text-[13px] leading-relaxed">
            <code className="font-mono text-zinc-100">{code}</code>
          </pre>
        </figure>
      );
    },
    image: ({ value }) => {
      const src = resolveImage(value, 1200);
      if (!src) return null;
      return (
        <span className="block relative my-6 w-full overflow-hidden rounded-2xl">
          <Image
            src={src}
            alt={value?.alt ?? ""}
            width={1200}
            height={800}
            unoptimized
            className="h-auto w-full object-cover"
          />
        </span>
      );
    },
  },
};

export default function PortableBody({ value }: { value: PortableContent }) {
  return <PortableText value={value} components={components} />;
}
