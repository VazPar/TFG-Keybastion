import React from 'react';

/**
 * Props for the PasswordStrengthIndicator component
 */
export interface PasswordStrengthIndicatorProps {
  /** 
   * Password strength score (0-100)
   * - 0-39: Weak (red)
   * - 40-59: Medium (yellow)
   * - 60-79: Strong (blue)
   * - 80-100: Very Strong (green)
   */
  strength: number;
}

/**
 * Component that displays a visual indicator of password strength.
 * 
 * This component renders a progress bar that changes color based on the password strength:
 * - Red: Weak (0-39)
 * - Yellow: Medium (40-59)
 * - Blue: Strong (60-79)
 * - Green: Very Strong (80-100)
 * 
 * It also displays a text label and percentage to provide additional context.
 * 
 * @param props - Component props
 * @returns A React component that visually represents password strength
 */
const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ strength }) => {
  // Determine the appropriate color and label based on the strength score
  let bgColor = 'bg-red-500';
  let label = 'Weak';

  if (strength >= 80) {
    bgColor = 'bg-green-500';
    label = 'Very Strong';
  } else if (strength >= 60) {
    bgColor = 'bg-blue-500';
    label = 'Strong';
  } else if (strength >= 40) {
    bgColor = 'bg-yellow-500';
    label = 'Medium';
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Password Strength: {label}</span>
        <span className="text-sm font-medium text-gray-700">{strength}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`${bgColor} h-2.5 rounded-full`} style={{ width: `${strength}%` }}></div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
