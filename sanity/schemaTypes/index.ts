import { type SchemaTypeDefinition } from "sanity";
import { post } from "./post";
import { project } from "./project";
import { certification } from "./certification";
import { testimonial } from "./testimonial";
import { lead } from "./lead";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [post, project, certification, testimonial, lead],
};
