import React from 'react'

import privacyLabel from './privacyLabel.en'

const Privacy = (): JSX.Element => (
  <>
    <h1>Skyderby Privacy Policy</h1>
    <p>
      Your privacy is very important to us. Check out our Privacy Label to see a summary
      of our privacy practices.
    </p>
    <h2>Privacy Label</h2>
    <table>
      {privacyLabel.map(section => (
        <tbody key={section.title}>
          <tr>
            <td colSpan={2}>
              <h3>{section.title}</h3>
            </td>
          </tr>
          {section.entries.map(entry => (
            <tr key={entry.question}>
              <td>{entry.question}</td>
              <td>
                <strong>{entry.answer}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  </>
)

export default Privacy
