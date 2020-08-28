const selectStyles = {
  container: (base, state) => ({
    ...base,
    ...(state.selectProps?.hide ? { display: 'none' } : {}),
    flexGrow: 1
  }),
  control: (base, state) => ({
    ...base,
    ...(state.selectProps?.isInvalid ? { borderColor: 'var(--red-80)' } : {}),
    borderRadius: 'var(--border-radius-md)',
    minHeight: '35px'
  }),
  dropdownIndicator: base => ({
    ...base,
    alignSelf: 'baseline',
    padding: '6px'
  })
}

export default selectStyles
