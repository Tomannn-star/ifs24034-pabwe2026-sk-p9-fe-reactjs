import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useInput from './useInput'

describe('useInput', () => {
  it('initializes with default and provided value', () => {
    const { result: res1 } = renderHook(() => useInput())
    expect(res1.current.value).toBe('')

    const { result: res2 } = renderHook(() => useInput('halo'))
    expect(res2.current.value).toBe('halo')
  })

  it('updates value via onChange event and direct value', () => {
    const { result } = renderHook(() => useInput('awal'))

    act(() => {
      result.current.onChange({ target: { value: 'event-value' } })
    })
    expect(result.current.value).toBe('event-value')

    act(() => {
      result.current.onChange('direct-value')
    })
    expect(result.current.value).toBe('direct-value')

    act(() => {
      result.current.setValue('explicit-set')
    })
    expect(result.current.value).toBe('explicit-set')
  })

  it('resets to initial value', () => {
    const { result } = renderHook(() => useInput('default'))

    act(() => {
      result.current.setValue('changed')
    })
    expect(result.current.value).toBe('changed')

    act(() => {
      result.current.reset()
    })
    expect(result.current.value).toBe('default')
  })
})
