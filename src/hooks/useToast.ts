import { createContext, useContext } from 'react'

export type ToastTone = 'default' | 'success' | 'error'

export type ShowToast = (message: string, tone?: ToastTone) => void

export const ToastContext = createContext<ShowToast>(() => {})

export const useToast = () => useContext(ToastContext)
