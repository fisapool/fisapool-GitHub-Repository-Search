import React from 'react';
import { render, screen, fireEvent } from '../testUtils/test-utils';
import MLComplianceControls from '../components/MLComplianceControls';

describe('MLComplianceControls', () => {
  const mockOnToggleML = jest.fn();
  const mockOnSetAnalysisDepth = jest.fn();
  const mockOnSetDataUsagePreference = jest.fn();
  
  const defaultProps = {
    onToggleML: mockOnToggleML,
    onSetAnalysisDepth: mockOnSetAnalysisDepth,
    onSetDataUsagePreference: mockOnSetDataUsagePreference,
    currentSettings: {
      mlEnabled: true,
      analysisDepth: 'standard' as const,
      dataUsagePreference: 'analysis-only' as const
    }
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should render collapsed by default', () => {
    render(<MLComplianceControls {...defaultProps} />);
    
    expect(screen.getByText('ML Analysis Controls')).toBeInTheDocument();
    expect(screen.queryByText('Privacy Notice:')).not.toBeInTheDocument();
  });
  
  test('should expand when header is clicked', () => {
    render(<MLComplianceControls {...defaultProps} />);
    
    fireEvent.click(screen.getByText('ML Analysis Controls'));
    
    expect(screen.getByText('Privacy Notice:')).toBeInTheDocument();
  });
  
  test('should toggle ML analysis', () => {
    render(<MLComplianceControls {...defaultProps} />);
    
    fireEvent.click(screen.getByText('ML Analysis Controls'));
    
    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);
    
    expect(mockOnToggleML).toHaveBeenCalledWith(false);
  });
  
  test('should set analysis depth', () => {
    render(<MLComplianceControls {...defaultProps} />);
    
    fireEvent.click(screen.getByText('ML Analysis Controls'));
    
    const select = screen.getByLabelText(/Analysis Depth/i);
    fireEvent.change(select, { target: { value: 'comprehensive' } });
    
    expect(mockOnSetAnalysisDepth).toHaveBeenCalledWith('comprehensive');
  });
  
  test('should set data usage preference', () => {
    render(<MLComplianceControls {...defaultProps} />);
    
    fireEvent.click(screen.getByText('ML Analysis Controls'));
    
    const select = screen.getByLabelText(/Data Usage Preference/i);
    fireEvent.change(select, { target: { value: 'improve-model' } });
    
    expect(mockOnSetDataUsagePreference).toHaveBeenCalledWith('improve-model');
  });
  
  test('should disable selects when ML is disabled', () => {
    render(
      <MLComplianceControls 
        {...defaultProps} 
        currentSettings={{
          ...defaultProps.currentSettings,
          mlEnabled: false
        }}
      />
    );
    
    fireEvent.click(screen.getByText('ML Analysis Controls'));
    
    const analysisDepthSelect = screen.getByLabelText(/Analysis Depth/i);
    const dataUsageSelect = screen.getByLabelText(/Data Usage Preference/i);
    
    expect(analysisDepthSelect).toBeDisabled();
    expect(dataUsageSelect).toBeDisabled();
  });
}); 