/**
 * Scroll a landing-page section into view.
 *
 * Sections carry scroll-margin-top (index.css) for the fixed navbar, so the
 * browser handles the offset. Coming from another page the section is not
 * mounted yet, so wait for it frame by frame (up to ~1s) instead of guessing
 * with a fixed timeout.
 *
 * @param {string} sectionId
 * @param {number} framesLeft
 */
export function scrollToSection(sectionId, framesLeft = 60) {
  const element = document.getElementById(sectionId);
  if (element) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  } else if (framesLeft > 0) {
    requestAnimationFrame(() => scrollToSection(sectionId, framesLeft - 1));
  }
}
