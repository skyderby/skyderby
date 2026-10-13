export default class Labels {
  constructor(dictionary = {}) {
    this.dictionary = dictionary
  }

  t(key, args = {}) {
    const text = this.dictionary[key]
    if (text == null) return key

    return text.replace(/%\{(\w+)\}/g, (match, name) =>
      name in args ? String(args[name]) : match
    )
  }
}
