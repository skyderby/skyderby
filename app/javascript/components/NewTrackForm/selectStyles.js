const selectStyles = {
  container: base => ({
    ...base,
    flexGrow: 1
  }),
  control: base => ({
    ...base,
    minHeight: '35px'
  }),
  dropdownIndicator: base => ({
    ...base,
    alignSelf: 'baseline',
    padding: '6px'
  })
}

export default selectStyles
