import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['crop', 'preview', 'x', 'y', 'h', 'w']
  connect() {}

  initJcrop() {
    if (this.jcrop) this.jcrop.destroy()

    const self = this
    const changeHandler = coords => {
      this.updateCoordinates(coords)
      this.updatePreview(coords)
    }

    this.cropTarget.removeAttribute('style')
    $(this.cropTarget).Jcrop(
      {
        keySupport: false,
        aspectRatio: 1,
        minSize: [150, 150],
        setSelect: [0, 0, 200, 200],
        onSelect: changeHandler,
        onChange: changeHandler,
        boxWidth: 390,
        boxHeight: 292
      },
      function () {
        self.jcrop = this
      }
    )
  }

  readFile(e) {
    const [file] = e.target.files
    if (!file || file === this.currentFile) return

    this.currentFile = file

    const reader = new FileReader()
    reader.onload = ({ target: { result: result } }) => {
      this.previewTarget.src = this.cropTarget.src = result
      this.initJcrop()
    }

    reader.readAsDataURL(file)
  }

  updateCoordinates(coords) {
    ;['x', 'y', 'h', 'w'].forEach(el => (this[`${el}Target`].value = coords[el]))
  }

  updatePreview(coords) {
    const cropWidth = this.cropTarget.width
    const cropHeight = this.cropTarget.height

    const styles = this.previewTarget.style

    styles.width = `${Math.round((150 / coords.w) * cropWidth)}px`
    styles.height = `${Math.round((150 / coords.h) * cropHeight)}px`
    styles.marginLeft = `-${Math.round((150 / coords.w) * coords.x)}px`
    styles.marginTop = `-${Math.round((150 / coords.h) * coords.y)}px`
  }
}
