import camelize from 'utils/camelize'

const getMetaElements = () => Array.from(document.head.querySelectorAll('meta'))

const Meta = new Proxy<Record<string, string | undefined>>(
  {},
  {
    get(_target, propertyName) {
      const metaElements = getMetaElements()

      return metaElements.find(({ name }) => camelize(name) === propertyName)?.content
    },
    set(_target, propertyName, value) {
      const metaElements = getMetaElements()

      const meta = metaElements.find(({ name }) => camelize(name) === propertyName)

      if (meta) meta.content = value

      return true
    }
  }
)

export default Meta
