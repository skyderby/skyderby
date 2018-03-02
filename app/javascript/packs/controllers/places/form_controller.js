import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = [ 'linesContainer', 'lineTemplate' ]

  add_line(e) {
    e.preventDefault();

    var template = this.line_template.split('__LINE_INDEX__').join(this.child_index());
    $(this.linesContainerTarget).append(template);
  }

  child_index() {
    return new Date().getTime();
  }

  get line_template() {
    return $(this.lineTemplateTarget).html()
  }
}
