import { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'

export const MarkdownEditor = ({
  initialValue = '',
  onChange,
  height = '500px',
  previewStyle = 'vertical',
  isDark = false,
}) => {
  const containerRef = useRef(null)
  const editorRef = useRef(null)

  useEffect(() => {
    const editor = new Editor({
      el: containerRef.current,
      height,
      initialEditType: 'markdown',
      previewStyle,
      initialValue,
      theme: isDark ? 'dark' : 'light',
      events: {
        change: () => {
          if (onChange) {
            onChange(editor.getMarkdown())
          }
        },
      },
    })

    editorRef.current = editor

    return () => {
      editor.destroy()
    }
  }, [isDark])

  useEffect(() => {
    const current = editorRef.current.getMarkdown()
    if (current !== initialValue) {
      editorRef.current.setMarkdown(initialValue)
    }
  }, [initialValue])

  return <div ref={containerRef} data-testid="markdown-editor" className="w-full" />
}

export default MarkdownEditor
