import { h } from 'preact'
import styled from 'styled-components'

import List from './List'

const Group = ({ number, competitors }) => {
  return (
    <Container>
      <Header>{`${I18n.t('events.rounds.map.group')} ${number}`}</Header>
      <List competitors={competitors} />
    </Container>
  )
}

const Header = styled.div`
  color: #777;
  font: 16px/24px 'Proxima Nova Semibold';
  padding-bottom: 5px;
  text-transform: uppercase;
`

const Container = styled.div`
  margin-bottom: 15px;
`

export default Group
