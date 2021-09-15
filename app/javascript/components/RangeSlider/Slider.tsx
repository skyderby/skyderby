import React from 'react'
import { Slider as ReactCompoundSlider, SliderProps } from 'react-compound-slider'
import { LinearScale } from './LinearScale'
import { DiscreteScale } from './DiscreteScale'

const prfx = 'react-compound-slider:'

type Comparator = (m: boolean | number, d: number, i: number) => boolean

const compare = (b: readonly number[]): Comparator => (m, d, i) =>
  m ? b[i] === d : false

const equal = (a: readonly number[], b: readonly number[]): boolean | number => {
  return a === b || (a.length === b.length && a.reduce(compare(b), true))
}

const getHandles = (values: readonly number[] = [], reversed: boolean | undefined) =>
  values
    .map((val, i) => ({ key: `$$-${i}`, val }))
    .sort((a, b) => (reversed ? b.val - a.val : a.val - b.val))

interface HandleItem {
  key: string
  val: number
}

type SliderState = {
  step: number
  values: Readonly<number[]>
  domain: Readonly<number[]>
  handles: HandleItem[]
  reversed: boolean
  activeHandleID: string
  valueToPerc: LinearScale
  valueToStep: DiscreteScale
  pixelToStep: DiscreteScale
}

const defaultStep = 1
const defaultDomain = [0, 100]

class Slider extends (ReactCompoundSlider as React.ComponentClass<
  SliderProps,
  SliderState
>) {
  state = {
    step: defaultStep,
    values: [],
    domain: defaultDomain,
    handles: [],
    reversed: false,
    activeHandleID: '',
    valueToPerc: new LinearScale(),
    valueToStep: new DiscreteScale(),
    pixelToStep: new DiscreteScale()
  }

  static getDerivedStateFromProps(
    nextProps: SliderProps,
    prevState: SliderState
  ): Partial<SliderState> | null {
    const {
      step = defaultStep,
      values,
      domain = defaultDomain,
      reversed,
      onUpdate,
      onChange
    } = nextProps

    let valueToPerc = prevState.valueToPerc
    let valueToStep = prevState.valueToStep
    let pixelToStep = prevState.pixelToStep

    const nextState: Partial<SliderState> = {}

    if (!valueToPerc || !valueToStep || !pixelToStep) {
      valueToPerc = new LinearScale()
      valueToStep = new DiscreteScale()
      pixelToStep = new DiscreteScale()

      nextState.valueToPerc = valueToPerc
      nextState.valueToStep = valueToStep
      nextState.pixelToStep = pixelToStep
    }

    if (
      prevState.step === null ||
      prevState.domain === null ||
      prevState.reversed === null ||
      step !== prevState.step ||
      domain[0] !== prevState.domain[0] ||
      domain[1] !== prevState.domain[1] ||
      reversed !== prevState.reversed
    ) {
      const [min, max] = domain
      if (min === undefined || max === undefined) return null

      valueToStep.setStep(step).setRange([min, max]).setDomain([min, max])

      if (reversed === true) {
        valueToPerc.setDomain([min, max]).setRange([100, 0])
        pixelToStep.setStep(step).setRange([max, min])
      } else {
        valueToPerc.setDomain([min, max]).setRange([0, 100])
        pixelToStep.setStep(step).setRange([min, max])
      }

      if (min > max) {
        console.warn(
          `${prfx} Max must be greater than min (even if reversed). Max is ${max}. Min is ${min}.`
        )
      }

      const handles = getHandles(values || prevState.values, reversed)

      if (values === undefined || values === prevState.values) {
        onUpdate?.(handles.map(d => d.val))
        onChange?.(handles.map(d => d.val))
      }

      nextState.step = step
      nextState.values = values
      nextState.domain = domain
      nextState.handles = handles
      nextState.reversed = reversed
    } else if (!equal(values, prevState.values)) {
      const handles = getHandles(values, reversed)

      nextState.values = values
      nextState.handles = handles
    }

    if (Object.keys(nextState).length) {
      return nextState
    }

    return null
  }
}

export default Slider
