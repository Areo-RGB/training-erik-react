import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Toggle from './Toggle'

describe('Toggle', () => {
  it('renders with label and description', () => {
    render(
      <Toggle
        enabled={false}
        onChange={() => {}}
        label="Test Label"
        description="Test Description"
      />
    )

    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('calls onChange when clicked', () => {
    const handleChange = vi.fn()
    render(
      <Toggle enabled={false} onChange={handleChange} label="Toggle" />
    )

    fireEvent.click(screen.getByRole('button'))
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('toggles from enabled to disabled', () => {
    const handleChange = vi.fn()
    render(
      <Toggle enabled={true} onChange={handleChange} label="Toggle" />
    )

    fireEvent.click(screen.getByRole('button'))
    expect(handleChange).toHaveBeenCalledWith(false)
  })

  it('has correct aria-pressed attribute', () => {
    const { rerender } = render(
      <Toggle enabled={false} onChange={() => {}} label="Toggle" />
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')

    rerender(<Toggle enabled={true} onChange={() => {}} label="Toggle" />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders card-style when className is provided', () => {
    const { container } = render(
      <Toggle
        enabled={false}
        onChange={() => {}}
        label="Card Toggle"
        className="custom-class"
      />
    )

    // The outer div should have the custom class
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('supports different sizes', () => {
    const { rerender } = render(
      <Toggle enabled={false} onChange={() => {}} label="Toggle" size="sm" />
    )
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('w-10', 'h-6')

    rerender(<Toggle enabled={false} onChange={() => {}} label="Toggle" size="md" />)
    button = screen.getByRole('button')
    expect(button).toHaveClass('w-12', 'h-7')
  })
})
