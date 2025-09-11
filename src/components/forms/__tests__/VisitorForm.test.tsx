import React from 'react';
import { render } from '@/test/utils/test-utils';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VisitorForm from '../VisitorForm';

// Mock Supabase
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockSelect = jest.fn();

jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: mockInsert.mockReturnThis(),
      update: mockUpdate.mockReturnThis(),
      select: mockSelect.mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
}));

const mockOnSuccess = jest.fn();
const mockOnCancel = jest.fn();

const defaultProps = {
  onSuccess: mockOnSuccess,
  onCancel: mockOnCancel,
};

describe('VisitorForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockResolvedValue({ data: {}, error: null });
    mockUpdate.mockResolvedValue({ data: {}, error: null });
  });

  it('renders form fields correctly', () => {
    render(<VisitorForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/purpose/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add visitor/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<VisitorForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /add visitor/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<VisitorForm {...defaultProps} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /add visitor/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('validates phone number format', async () => {
    const user = userEvent.setup();
    render(<VisitorForm {...defaultProps} />);
    
    const phoneInput = screen.getByLabelText(/phone/i);
    await user.type(phoneInput, '123');
    
    const submitButton = screen.getByRole('button', { name: /add visitor/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/phone number must be at least 10 digits/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<VisitorForm {...defaultProps} />);
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/phone/i), '1234567890');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/purpose/i), 'Meeting');
    
    const submitButton = screen.getByRole('button', { name: /add visitor/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        name: 'John Doe',
        phone: '1234567890',
        email: 'john@example.com',
        purpose: 'Meeting',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles edit mode correctly', () => {
    const editData = {
      id: '1',
      name: 'Jane Doe',
      phone: '0987654321',
      email: 'jane@example.com',
      purpose: 'Visit',
    };

    render(<VisitorForm {...defaultProps} editData={editData} />);
    
    expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0987654321')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Visit')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update visitor/i })).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<VisitorForm {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('handles submission errors', async () => {
    const user = userEvent.setup();
    mockInsert.mockResolvedValueOnce({ data: null, error: { message: 'Database error' } });
    
    render(<VisitorForm {...defaultProps} />);
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/phone/i), '1234567890');
    
    const submitButton = screen.getByRole('button', { name: /add visitor/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/database error/i)).toBeInTheDocument();
    });
  });
});