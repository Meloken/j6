import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../../src/components/common/Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPress} />);
    
    expect(getByText('Test Button')).toBeTruthy();
  });
  
  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPress} />);
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  
  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPress} disabled={true} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).not.toHaveBeenCalled();
  });
  
  it('shows loading indicator when loading is true', () => {
    const onPress = jest.fn();
    const { queryByText, UNSAFE_getByType } = render(
      <Button title="Test Button" onPress={onPress} loading={true} />
    );
    
    expect(queryByText('Test Button')).toBeNull();
    expect(UNSAFE_getByType('ActivityIndicator')).toBeTruthy();
  });
  
  it('applies different styles based on type prop', () => {
    const onPress = jest.fn();
    const { rerender, getByText } = render(
      <Button title="Primary Button" onPress={onPress} type="primary" />
    );
    
    const primaryButton = getByText('Primary Button').parent;
    expect(primaryButton?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: '#7289da' }),
      ])
    );
    
    rerender(<Button title="Secondary Button" onPress={onPress} type="secondary" />);
    
    const secondaryButton = getByText('Secondary Button').parent;
    expect(secondaryButton?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: 'transparent' }),
      ])
    );
    
    rerender(<Button title="Danger Button" onPress={onPress} type="danger" />);
    
    const dangerButton = getByText('Danger Button').parent;
    expect(dangerButton?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: '#f04747' }),
      ])
    );
  });
  
  it('applies different styles based on size prop', () => {
    const onPress = jest.fn();
    const { rerender, getByText } = render(
      <Button title="Small Button" onPress={onPress} size="small" />
    );
    
    const smallButton = getByText('Small Button').parent;
    expect(smallButton?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ height: 32 }),
      ])
    );
    
    rerender(<Button title="Medium Button" onPress={onPress} size="medium" />);
    
    const mediumButton = getByText('Medium Button').parent;
    expect(mediumButton?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ height: 44 }),
      ])
    );
    
    rerender(<Button title="Large Button" onPress={onPress} size="large" />);
    
    const largeButton = getByText('Large Button').parent;
    expect(largeButton?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ height: 52 }),
      ])
    );
  });
});
