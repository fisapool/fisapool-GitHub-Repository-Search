/**
 * Removes repository comparison elements from the DOM
 */
export function removeComparisonElements() {
  // Run after a small delay to ensure DOM is loaded
  setTimeout(() => {
    const comparisonElements = document.querySelectorAll('.repository-comparison');
    comparisonElements.forEach(element => {
      element.remove();
    });
  }, 100);
} 