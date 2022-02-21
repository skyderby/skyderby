import React from 'react'
import { Route, Switch, match, NavLink } from 'react-router-dom'

import AppShell from 'components/AppShell'
import Privacy from './Privacy'
import styles from './styles.module.scss'

type LegalProps = {
  match: match
}

const Legal = ({ match }: LegalProps): JSX.Element => (
  <AppShell>
    <div className={styles.container}>
      <aside className={styles.navbar}>
        <ul>
          <li>
            <NavLink to={`${match.path}/privacy`}>Privacy</NavLink>
          </li>
          <li>
            <NavLink to={`${match.path}/terms_of_service`}>Terms of Service</NavLink>
          </li>
          <li>
            <NavLink to={`${match.path}/user_data_deletion`}>User Data Deletion</NavLink>
          </li>
        </ul>
      </aside>

      <main>
        <Switch>
          <Route path={`${match.path}/privacy`} component={Privacy} />
          <Route path={`${match.path}/terms_of_service`} />
          <Route path={`${match.path}/user_data_deletion`} />
        </Switch>
      </main>
    </div>
  </AppShell>
)

export default Legal
