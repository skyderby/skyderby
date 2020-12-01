const selectStyles = {
  container: (base, state) => ({
    ...base,
    ...(state.selectProps?.hide ? { display: 'none' } : {}),
    flexGrow: 1
  }),
  control: (base, state) => ({
    ...base,
    borderColor: state.selectProps?.isInvalid ? 'var(--red-80)' : 'var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    minHeight: '2.1875rem'
  }),
  dropdownIndicator: base => ({
    ...base,
    alignSelf: 'baseline',
    padding: '6px'
  }),
  menuPortal: base => ({ ...base, zIndex: 1100 })
}

export default selectStyles
