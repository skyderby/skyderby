export const sizes = {
  small: '768px',
  medium: '992px',
  large: '1200px'
}

export const devices = Object.fromEntries(
  Object.entries(sizes).map(([key, size]) => [key, `(min-width: ${size})`])
)
