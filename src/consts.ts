import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Kanishka Jha",
  EMAIL: "kanishkajha1203@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 5,
  NUM_WORKS_ON_HOMEPAGE: 4,
  NUM_PROJECTS_ON_HOMEPAGE: 4,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION:
    "Offensive Security Engineer focused on VAPT, Active Directory, cloud security, adversarial testing, and real-world attack paths.",
};

export const BLOG: Metadata = {
  TITLE: "Writeups",
  DESCRIPTION:
    "Technical writeups on Active Directory attacks, web application security, CTFs, cloud exploitation, adversarial testing, and vulnerability research.",
};

export const WORK: Metadata = {
  TITLE: "Experience",
  DESCRIPTION:
    "Experience across penetration testing, Active Directory security, AppSec, AI security testing, enterprise assessments, and adversarial simulations.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION:
    "Security tooling, offensive security automation, vulnerable labs, reconnaissance frameworks, and cybersecurity research projects.",
};

export const SOCIALS: Socials = [
  {
    NAME: "github",
    HREF: "https://github.com/Kanishkajha29",
  },
  {
    NAME: "linkedin",
    HREF: "https://www.linkedin.com/in/kanishka-jha-341987249/",
  },
];  