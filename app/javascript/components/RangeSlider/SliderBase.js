import { Slider as ReactCompoundSlider } from 'react-compound-slider'
import { LinearScale } from './LinearScale'
import { DiscreteScale } from './DiscreteScale'

class SliderBase extends ReactCompoundSlider {
  state = {
    step: 0.1,
    values: [],
    domain: [0, 100],
    handles: [],
    reversed: false,
    activeHandleID: '',
    valueToPerc: new LinearScale(),
    valueToStep: new DiscreteScale(),
    pixelToStep: new DiscreteScale()
  }
}

export default SliderBase
