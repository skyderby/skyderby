import load_script from 'utils/load_script'

export default function() {
  if (window.maps_api_ready) {
    document.dispatchEvent(new Event('maps_api:ready', { bubbles: true, cancellable: true }))
  } else {
    load_script(
      'https://maps.googleapis.com/maps/api/js?callback=on_maps_api_ready&key=' + MAPS_API_KEY,
      { on_error: on_maps_api_loading_error }
    )
  }
}

window.on_maps_api_ready = () => {
  window.maps_api_ready = true
  document.dispatchEvent(new Event('maps_api:ready', { bubbles: true, cancellable: true }))
}

window.on_maps_api_loading_error = () => {
  window.maps_api_ready = false
  document.dispatchEvent(new Event('maps_api:failed', { bubbles: true, cancellable: true }));
}
