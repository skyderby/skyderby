import React from 'react'
import { MobileOnlyView, BrowserView } from 'react-device-detect'

import DesktopList from './DesktopList'
import MobileList from './MobileList'

const List = () => {
  return (
    <>
      <BrowserView renderWithFragment>
        <DesktopList />
      </BrowserView>
      <MobileOnlyView renderWithFragment>
        <MobileList />
      </MobileOnlyView>
    </>
  )
}

export default List
