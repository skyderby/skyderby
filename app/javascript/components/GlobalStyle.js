import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  :root {
    --blue-50: #00a7ff;
    --blue-60: #008ed9;

    --red-70: #ff5e5e;
    --red-80: #d61e1e;

    --green-50: #349e34;
    --green-40: #5cb85c;

    --grey-90: #333;
    --grey-80: #555;
    --grey-40: #aaa;
    --grey-30: #d3d3d3;
    --grey-20: #e8e8e8;
    --grey-10: #f3f3f3;

    --white: #fff;

    --border-color: var(--grey-30);
    --text-color: var(--grey-90);

    --border-radius-lg: 0.5rem;
    --border-radius-md: 0.25rem;
    --border-radius-sm: 0.125rem;
  }
`

export default GlobalStyle
