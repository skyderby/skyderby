document.addEventListener('turbo:load', () => {
  gtag('event', 'page_view', { page_path: window.location.pathname })
})
