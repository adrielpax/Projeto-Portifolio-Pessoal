import type { PortableTextBlock } from "@portabletext/react";
import type { SanityImageSource } from "@sanity/image-url";

/** Imagem pode vir do Sanity (objeto) ou ser um caminho local (fallback). */
export type ImageRef = SanityImageSource | string;

/**
 * Conteúdo do corpo do post: blocos de texto + tipos custom (imagem, código).
 */
export type PortableContent = (
  | PortableTextBlock
  | { _type: string; _key: string; [key: string]: unknown }
)[];

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: ImageRef;
  tags?: string[];
  publishedAt: string;
  featured?: boolean;
  body?: PortableContent;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Metric {
  value: string;
  label: string;
}

export interface Project {
  _id: string;
  title: string;
  slug?: string;
  username?: string;
  description: string;
  image?: ImageRef;
  link?: string;
  repo?: string;
  role?: string;
  year?: string;
  status?: "producao" | "desenvolvimento" | "concluido" | "arquivado";
  stack?: string[];
  metrics?: Metric[];
  featured?: boolean;
  problem?: string;
  solution?: string;
  outcome?: string;
}

export interface Testimonial {
  _id: string;
  quote: string;
  author: string;
  role?: string;
  avatar?: ImageRef;
  sourceUrl?: string;
}

export interface Certification {
  _id: string;
  title: string;
  issuer?: string;
  logo?: ImageRef;
  credentialUrl?: string;
  issuedAt?: string;
}
