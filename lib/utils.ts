import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};

// This function will generate a different cover for each page load while maintaining consistency during the same load
export const getRefreshableInterviewCover = (id: string) => {
  // Use a combination of ID and a timestamp that changes on every page load
  // Using seconds instead of hours for more frequent changes
  const timestamp = Math.floor(Date.now() / 1000); // Changes every second
  const combined = id + timestamp.toString();
  const hash = combined.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const index = Math.abs(hash) % interviewCovers.length;
  return `/covers${interviewCovers[index]}`;
};

export const getDeterministicInterviewCover = (id: string) => {
  // Use the first character of the ID to deterministically select a cover
  const firstChar = id.charAt(0);
  const charCode = firstChar.charCodeAt(0);
  const index = charCode % interviewCovers.length;
  return `/covers${interviewCovers[index]}`;
};
