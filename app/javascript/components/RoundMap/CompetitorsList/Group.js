import React from 'react'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { selectGroup } from 'redux/events/roundMap'
import List from './List'
import CompetitorResult from './CompetitorResult'
import FlatButton from 'components/ui/FlatButton'

const Group = ({ resultIds, number }) => {
  const dispatch = useDispatch()

  const handleSelect = () => dispatch(selectGroup(resultIds))

  return (
    <Container>
      <Header>
        <span>{`${I18n.t('events.rounds.map.group')} ${number}`}</span>
        <FlatButton onClick={handleSelect}>Select</FlatButton>
      </Header>
      <List>
        {resultIds.map((resultId, idx) => (
          <CompetitorResult resultId={resultId} key={idx} />
        ))}
      </List>
    </Container>
  )
}

const Header = styled.div`
  color: #777;
  font: 16px/24px 'Proxima Nova Semibold';
  padding-bottom: 5px;
  text-transform: uppercase;

  > * {
    margin-right: 10px;
  }
`

const Container = styled.div`
  padding: 10px;
  margin-bottom: 15px;
`

Group.propTypes = {
  resultIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  number: PropTypes.number.isRequired
}

export default Group
