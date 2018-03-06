import { Controller } from 'stimulus'

export default class extends Controller {
  initialize() {
    this.cached_measurements = {}
  }

  toggle(event) {
    const select = event.target
    const line_id = select.value

    if (line_id) {
      const line_name = select.options[select.selectedIndex].text

      this.on_select_line(line_id, line_name)
    } else {
      this.on_unselect_line()
    }
  }

  on_select_line(line_id, line_name) {
    this.fetch_measurements(line_id)
      .then( (data) => { this.dispatch_select_line(data, line_name) })
  }

  on_unselect_line() {
    const event = new CustomEvent('flight-profiles:line-unselected', { bubbles: true })
    this.element.dispatchEvent(event)
  }

  fetch_measurements(line_id) {
    return new Promise((resolve) => {
      if (this.cached_measurements[line_id]) {
        resolve(this.cached_measurements[line_id])
      } else {
        $.get('/api/v1/places/exit_measurements/' + line_id)
          .done( data => {
            const chart_data = this.convert_response(data) 
            this.cached_measurements[line_id] = chart_data
            resolve(chart_data)
          })
      }
    })
  }

  convert_response(data) {
    const max_altitude = data[data.length-1].altitude

    return data.map((el) => {
      return [el.distance, el.altitude, max_altitude]
    })
  }

  dispatch_select_line(data, name) {
    const event = new CustomEvent('flight-profiles:line-selected', {
      detail: {
        name: name,
        measurements: data
      },
      bubbles: true
    })
    this.element.dispatchEvent(event)
  }
}
