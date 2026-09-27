import { groq } from "next-sanity";

export const postsQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id, title, "slug": slug.current, excerpt, coverImage, tags,
    publishedAt, featured
  }
`;

export const postSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)].slug.current
`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id, title, "slug": slug.current, excerpt, coverImage, tags,
    publishedAt, body, seoTitle, seoDescription
  }
`;

export const projectsQuery = groq`
  *[_type == "project"] | order(featured desc, order asc, _createdAt desc) {
    _id, title, "slug": slug.current, username, description, image, link, repo,
    role, year, status, stack, metrics, featured
  }
`;

export const projectSlugsQuery = groq`
  *[_type == "project" && defined(slug.current)].slug.current
`;

export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id, title, "slug": slug.current, username, description, image, link, repo,
    role, year, status, stack, metrics, problem, solution, outcome
  }
`;

export const testimonialsQuery = groq`
  *[_type == "testimonial"] | order(order asc, _createdAt desc) {
    _id, quote, author, role, avatar, sourceUrl
  }
`;

export const certificationsQuery = groq`
  *[_type == "certification"] | order(order asc, _createdAt desc) {
    _id, title, issuer, logo, credentialUrl, issuedAt
  }
`;
