import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = [ 'container', 'template' ]

  add(e) {
    e.preventDefault();

    var template = this.template.split('__M_INDEX__').join(this.child_index());
    $(this.containerTarget).append(template);
  }

  remove(e) {
    e.preventDefault();
    var tr = $(e.currentTarget).closest('tr');
    tr.find('input[name$="[_destroy]"]').val(true);
    tr.hide();
  }

  child_index() {
    return new Date().getTime();
  }

  get template() {
    return $(this.templateTarget).html()
  }
}
