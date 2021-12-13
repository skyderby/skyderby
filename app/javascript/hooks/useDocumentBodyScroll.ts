const bodyClassName = 'modalShown'
const setScroll = ({ enabled }: { enabled: boolean }): void => {
  if (enabled) {
    document.body.classList.remove(bodyClassName)
  } else {
    document.body.classList.add(bodyClassName)
  }
}

const enableScroll = () => setScroll({ enabled: true })
const disableScroll = () => setScroll({ enabled: false })

const useDocumentBodyScroll = () => ({ enableScroll, disableScroll, setScroll })

export default useDocumentBodyScroll
