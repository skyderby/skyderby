import { createContext, useContext } from 'react'

const pageContext = createContext()

export const usePageContext = () => {
  return useContext(pageContext)
}

export const PageContext = pageContext.Provider
