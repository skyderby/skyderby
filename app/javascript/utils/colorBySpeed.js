export const colorBySpeed = speed => {
  if (speed > 250) return '#60000C'
  else if (speed > 220) return '#E7000C'
  else if (speed > 190) return '#E4670F'
  else if (speed > 160) return '#D9CE34'
  else if (speed > 130) return '#42C043'
  else return '#2D7E2E'
}
