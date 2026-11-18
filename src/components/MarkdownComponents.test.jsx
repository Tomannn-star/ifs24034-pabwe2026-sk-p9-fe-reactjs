import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MarkdownEditor from './MarkdownEditor'
import MarkdownViewer from './MarkdownViewer'

const { MockEditor } = vi.hoisted(() => {
  class MockEditor {
    constructor(config) {
      this.markdown = config?.initialValue || ''
      this.events = config?.events
      MockEditor.latestInstance = this
    }
    getMarkdown() {
      return this.markdown
    }
    setMarkdown(val) {
      this.markdown = val
      if (this.events?.change) this.events.change()
    }
    destroy() {}
  }

  MockEditor.factory = (config) => new MockEditor(config)
  return { MockEditor }
})

vi.mock('@toast-ui/editor', () => ({
  default: MockEditor,
}))

describe('MarkdownComponents', () => {
  it('renders MarkdownEditor with defaults, triggers change with and without handler, and unmounts cleanly', () => {
    // Default props render
    const defaultRender = render(<MarkdownEditor />)
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
    defaultRender.unmount()

    const handleChange = vi.fn()
    const { rerender, unmount } = render(
      <MarkdownEditor initialValue="# Heading" onChange={handleChange} isDark={true} />
    )

    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()

    // Rerender with updated initialValue
    rerender(
      <MarkdownEditor initialValue="# New Heading" onChange={handleChange} isDark={true} />
    )

    // Rerender with same initialValue
    rerender(
      <MarkdownEditor initialValue="# New Heading" onChange={handleChange} isDark={true} />
    )

    // Rerender without onChange handler and isDark=false
    rerender(
      <MarkdownEditor initialValue="# Untracked" isDark={false} />
    )
    // Trigger change when onChange is undefined
    MockEditor.latestInstance.events.change()

    unmount()
  })

  it('renders MarkdownViewer with defaults and updates value in light and dark mode', () => {
    // Default props render
    const defaultRender = render(<MarkdownViewer />)
    expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument()
    defaultRender.unmount()

    const { rerender, unmount } = render(
      <MarkdownViewer initialValue="Preview text" isDark={false} />
    )

    expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument()

    rerender(
      <MarkdownViewer initialValue="Updated text" isDark={true} />
    )

    unmount()
  })
})
