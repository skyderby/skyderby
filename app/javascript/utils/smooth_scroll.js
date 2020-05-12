export default function (element, target_position = 0, duration = 1000) {
  const start_position = element.scrollTop
  const change = target_position - start_position
  const start_time = Number(new Date())

  const animate_scroll = () => {
    const time_from_start = Number(new Date()) - start_time
    element.scrollTop = parseInt(
      ease_in_out_quad(time_from_start, start_position, change, duration)
    )

    if (time_from_start < duration) {
      requestAnimationFrame(animate_scroll)
    } else {
      element.scrollTop = target_position
    }
  }

  animate_scroll()
}

function ease_in_out_quad(time, start, change, duration) {
  time /= duration / 2
  if (time < 1) return (change / 2) * time * time + start
  time--
  return (-change / 2) * (time * (time - 2) - 1) + start
}
