class FakeEvent {
  constructor(target) {
    this.target = target
  }

  preventDefault() {}

  stopPropagation() {}

  stopImmediatePropagation() {}
}

export default function handleRemote(element) {
  Rails.handleRemote.call(element, new FakeEvent(element))
}
