import { useCallback } from "react";
import { useNavigate } from "react-router";

export function usePageTransition() {
  const navigate = useNavigate();

  const navigateWithTransition = useCallback((to: string) => {
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Add fade-out class to content
    const content = document.querySelector("[data-page-content]");
    if (content) {
      content.classList.add("page-exit");
    }

    // Navigate after animation
    setTimeout(() => {
      navigate(to);
      // Remove exit class and add enter class
      requestAnimationFrame(() => {
        const newContent = document.querySelector("[data-page-content]");
        if (newContent) {
          newContent.classList.remove("page-exit");
          newContent.classList.add("page-enter");
          // Clean up enter class
          setTimeout(() => {
            newContent.classList.remove("page-enter");
          }, 300);
        }
      });
    }, 150);
  }, [navigate]);

  return { navigateWithTransition };
}
