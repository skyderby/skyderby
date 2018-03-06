import { Controller } from 'stimulus'
import 'bootstrap-datepicker'
import 'bootstrap-datepicker/js/locales/bootstrap-datepicker.ru'
import 'bootstrap-datepicker/js/locales/bootstrap-datepicker.de'
import 'bootstrap-datepicker/js/locales/bootstrap-datepicker.es'
import 'bootstrap-datepicker/dist/css/bootstrap-datepicker3.css'

export default class extends Controller {
  connect() {
    let options = {
      format: 'dd.mm.yyyy',
      startDate: 0,
      language: I18n.locale,
      autoclose: true,
      todayHighlight: true
    }

    $(this.element).datepicker(options)
  }
}
