import { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'

export const MarkdownViewer = ({ initialValue = '', isDark = false }) => {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)

  useEffect(() => {
    const viewer = Editor.factory({
      el: containerRef.current,
      viewer: true,
      initialValue,
      theme: isDark ? 'dark' : 'light',
    })

    viewerRef.current = viewer

    return () => {
      viewer.destroy()
    }
  }, [isDark])

  useEffect(() => {
    viewerRef.current.setMarkdown(initialValue)
  }, [initialValue])

  return <div ref={containerRef} data-testid="markdown-viewer" className="w-full prose dark:prose-invert max-w-none" />
}

export default MarkdownViewer
