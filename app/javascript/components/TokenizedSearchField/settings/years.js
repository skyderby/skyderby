import React from 'react'

import CalendarIcon from 'icons/calendar.svg'

const allYears = Array(new Date().getFullYear() - 2014 + 1).fill().map((_v, idx) => (2014 + idx).toString())

export default {
  type: 'year',
  icon: <CalendarIcon />,
  label: 'Year',
  getOptions: async input => {
    const years = allYears.map(year => ({ label: year, value: year }))

    return years.filter(({ label }) => label.includes(input))
  },
  loadOption: async year => {
    const isValid = allYears.indexOf(year) !== -1

    if (!isValid) return

    return { label: year, value: year }
  }
}
