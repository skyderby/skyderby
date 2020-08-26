import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  :root {
    --blue-40: #75a4ba;
    --blue-50: #00a7ff;
    --blue-60: #008ed9;

    --red-70: #ff5e5e;
    --red-80: #d61e1e;

    --green-50: #349e34;
    --green-40: #5cb85c;

    --grey-90: #333;
    --grey-80: #555;
    --grey-70: #777;
    --grey-50: #999;
    --grey-40: #aaa;
    --grey-30: #d3d3d3;
    --grey-20: #eee;
    --grey-10: #f3f3f3;
    --grey-5: #fafafa;

    --white: #fff;

    --border-color: var(--grey-30);
    --text-color: var(--grey-90);

    --border-radius-lg: 1rem;
    --border-radius-md: 0.5rem;
    --border-radius-sm: 0.375rem;
  }
`

export default GlobalStyle
