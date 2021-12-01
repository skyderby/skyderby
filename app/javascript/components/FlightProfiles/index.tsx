import React, { useEffect, useState } from 'react'
import { ValueType } from 'react-select'
import { Helmet } from 'react-helmet'

import { useI18n } from 'components/TranslationsProvider'
import usePageParams from 'components/FlightProfiles/usePageParams'
import CogIcon from 'icons/cog.svg'
import FlightProfilesChart from './FlightProfilesChart'
import TerrainClearanceChart from './TerrainClearanceChart'
import Tagbar from './Tagbar'
import TrackList from './TrackList'
import TerrainProfileSelect from './TerrainProfileSelect'
import SettingsModal from './SettingsModal'
import styles from './styles.module.scss'

const straightLineKey = 'flightProfiles/unroll'

const getStraightLineSavedSetting = () => {
  const localStorageValue = localStorage.getItem(straightLineKey)
  if (localStorageValue === null) return false
  return localStorageValue.toLowerCase() === 'true'
}

const FlightProfiles = (): JSX.Element => {
  const { t } = useI18n()
  const [zoomLevel, setZoomLevel] = useState<{ min: number; max: number } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [straightLine, setStraightLine] = useState<boolean>(getStraightLineSavedSetting)

  useEffect(() => {
    localStorage.setItem(straightLineKey, String(straightLine))
  }, [straightLine])

  const {
    params: { selectedTerrainProfile, selectedTracks, additionalTerrainProfiles },
    setSelectedTerrainProfile,
    setAdditionalTerrainProfiles
  } = usePageParams()

  const applySettings = ({
    straightLine,
    additionalTerrainProfiles
  }: {
    straightLine: string
    additionalTerrainProfiles: number[]
  }) => {
    setStraightLine(straightLine === 'true')
    setAdditionalTerrainProfiles(additionalTerrainProfiles)

    setShowModal(false)
  }

  return (
    <section className={styles.container}>
      <Helmet>
        <title>{t('flight_profiles.title')}</title>
        <meta name="description" content={t('flight_profiles.description')} />
      </Helmet>
      <aside className={styles.settingsContainer}>
        <TrackList />

        <div className={styles.terrainProfileSelect}>
          <TerrainProfileSelect
            value={selectedTerrainProfile}
            onChange={(option: ValueType<{ value: number }, false>) =>
              setSelectedTerrainProfile(option?.value || null)
            }
          />
        </div>
      </aside>

      <main id="maincontent" className={styles.charts}>
        <div>
          <FlightProfilesChart straightLine={straightLine} onZoomChange={setZoomLevel} />
        </div>

        <Tagbar />

        <div>
          <TerrainClearanceChart
            zoomLevel={zoomLevel}
            selectedTracks={selectedTracks}
            selectedTerrainProfile={selectedTerrainProfile}
            straightLine={straightLine}
          />
        </div>

        <button
          className={styles.fab}
          onClick={() => setShowModal(true)}
          aria-label={t('general.settings')}
        >
          <CogIcon />
        </button>

        <SettingsModal
          initialValues={{
            straightLine: String(straightLine),
            additionalTerrainProfiles
          }}
          isShown={showModal}
          onHide={() => setShowModal(false)}
          onSubmit={applySettings}
        />
      </main>
    </section>
  )
}

export default FlightProfiles
