//function to scroll smoothly to another section
export function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  } else if (import.meta.env.DEV) {
    console.warn(`Section with ID '${sectionId}' not found.`);
  }
}
