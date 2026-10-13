import type { ImageMetadata } from "astro";
import portrait from "../assets/headshot.png";

export type NavItem = {
  label: string;
  href: string;
};

export type SiteData = {
  name: string;
  title: string;
  positioningLine: string;
  contactSentence: string;
  headshot: {
    src: ImageMetadata;
    alt: string;
  };
  contact: {
    email: string;
    linkedin: string;
  };
  nav: NavItem[];
};

const site: SiteData = {
  name: "Kyle Putnam",
  title: "Product & Platform Leader",
  positioningLine:
    "Shaping product strategy and aligning platform architecture for durable, scalable systems.",
  contactSentence:
    "Open to conversations around product strategy, platform architecture, and system transformation.",
  headshot: {
    src: portrait,
    alt: "Portrait of Kyle Putnam"
  },
  contact: {
    email: "kyle@putnam.io",
    linkedin: "https://www.linkedin.com/in/kmputnam/"
  },
  nav: [
    {
      label: "Initiatives",
      href: "/initiatives/"
    },
    {
      label: "Writing",
      href: "/writing/"
    },
    {
      label: "Direction",
      href: "/direction/"
    },
    {
      label: "Contact",
      href: "/contact/"
    }
  ]
};

export default site;
