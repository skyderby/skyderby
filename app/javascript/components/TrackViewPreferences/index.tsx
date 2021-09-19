import React, { createContext, useContext, useEffect, useState } from 'react'

export const SINGLE_CHART = 'single' as const
export const SEPARATE_CHARTS = 'separate' as const

export const METRIC = 'metric' as const
export const IMPERIAL = 'imperial' as const

const allowedChartMode = [SINGLE_CHART, SEPARATE_CHARTS] as const
const allowedUnitSystems = [METRIC, IMPERIAL] as const

export type ChartMode = typeof allowedChartMode[number]
export type UnitSystem = typeof allowedUnitSystems[number]

export interface ViewPreferences {
  chartMode: ChartMode
  unitSystem: UnitSystem
}

const isAllowedChartMode = (chartMode: string | null): chartMode is ChartMode => {
  if (!chartMode) return false
  return allowedChartMode.includes(chartMode as ChartMode)
}

const isAllowedUnitSystem = (unitSystem: string | null): unitSystem is UnitSystem => {
  if (!unitSystem) return false
  return allowedUnitSystems.includes(unitSystem as UnitSystem)
}

const isValidPreferences = (value: Record<string, string>): boolean => {
  return (
    'chartMode' in value &&
    isAllowedChartMode(value.chartMode) &&
    'unitSystem' in value &&
    isAllowedUnitSystem(value.unitSystem)
  )
}

const defaultPreferences = {
  chartMode: 'separate' as const,
  unitSystem: 'metric' as const
}

const viewPreferencesKey = 'tracks_viewPreferences'

const loadPreferences = (): ViewPreferences => {
  const localStorageValue = localStorage.getItem(viewPreferencesKey)
  if (!localStorageValue) return defaultPreferences

  try {
    const decodedValue = JSON.parse(localStorageValue)
    if (isValidPreferences(decodedValue)) return decodedValue
  } catch {
    // nothing to do here
  }

  return defaultPreferences
}

type UseTrackViewPreferences = {
  viewPreferences: ViewPreferences
  setViewPreferences: React.Dispatch<React.SetStateAction<ViewPreferences>>
}

const TrackViewPreferencesContext = createContext<UseTrackViewPreferences | undefined>(
  undefined
)

type TrackViewPreferencesProviderProps = {
  children: React.ReactNode
}

const TrackViewPreferencesProvider = ({
  children
}: TrackViewPreferencesProviderProps): JSX.Element => {
  const [viewPreferences, setViewPreferences] = useState<ViewPreferences>(loadPreferences)

  useEffect(() => {
    localStorage.setItem(viewPreferencesKey, JSON.stringify(viewPreferences))
  }, [viewPreferences])

  return (
    <TrackViewPreferencesContext.Provider value={{ viewPreferences, setViewPreferences }}>
      {children}
    </TrackViewPreferencesContext.Provider>
  )
}

export const useTrackViewPreferences = (): UseTrackViewPreferences => {
  const context = useContext(TrackViewPreferencesContext)

  if (context === undefined) {
    throw new Error('useI18n must be used within a TranslationsProvider')
  }

  return context
}

export default TrackViewPreferencesProvider
