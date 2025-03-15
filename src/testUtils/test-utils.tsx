import React from 'react';
import { render } from '@testing-library/react';

// Custom render method that allows for providing a custom wrapper
const customRender = (ui: React.ReactElement, options = {}) => {
  return render(ui, {
    wrapper: ({ children }) => <React.Fragment>{children}</React.Fragment>,
    ...options,
  });
};

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override the render method
export { customRender as render }; 