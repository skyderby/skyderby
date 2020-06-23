export default {
  container: base => ({
    ...base,
    minWidth: '220px'
  }),
  control: base => ({
    ...base,
    border: 0,
    minHeight: 'auto'
  }),
  indicatorsContainer: base => ({
    ...base,
    display: 'none'
  }),
  input: base => ({
    ...base,
    padding: 0,
    margin: 0
  }),
  option: base => ({
    ...base,
    svg: {
      height: '0.8em',
      width: '1rem',
      path: {
        fill: '#777'
      }
    },
    '> *:not(:last-child)': {
      marginRight: '0.5rem'
    }
  }),
  valueContainer: base => ({
    ...base,
    padding: '2px 8px 2px 4px'
  })
}
