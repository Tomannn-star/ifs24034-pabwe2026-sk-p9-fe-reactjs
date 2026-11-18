import { useState, useCallback } from 'react'

export const useInput = (initialValue = '') => {
  const [value, setValue] = useState(initialValue)

  const onChange = useCallback((e) => {
    if (e && e.target !== undefined) {
      setValue(e.target.value)
    } else {
      setValue(e)
    }
  }, [])

  const reset = useCallback(() => {
    setValue(initialValue)
  }, [initialValue])

  return {
    value,
    setValue,
    onChange,
    reset,
    bind: {
      value,
      onChange,
    },
  }
}

export default useInput
