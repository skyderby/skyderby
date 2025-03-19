import { Controller } from '@hotwired/stimulus'
import 'bootstrap-datepicker'
import 'bootstrap-datepicker/js/locales/bootstrap-datepicker.ru'
import 'bootstrap-datepicker/js/locales/bootstrap-datepicker.de'
import 'bootstrap-datepicker/js/locales/bootstrap-datepicker.es'
import 'bootstrap-datepicker/dist/css/bootstrap-datepicker3.css'
import I18n from 'i18n'

export default class extends Controller {
  connect() {
    const options = {
      format: 'dd.mm.yyyy',
      startDate: 0,
      language: I18n.locale,
      autoclose: true,
      todayHighlight: true
    }

    $(this.element).datepicker(options)
  }
}
