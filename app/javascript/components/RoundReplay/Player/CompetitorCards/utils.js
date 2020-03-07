import colors from 'utils/colors'

const boxHeight = 250
const boxWidth = 759

function drawSpeedometer(ctx, textX, textY, point) {
  const speedometerX = textX + 600
  const speedometerY = textY + 60
  const textMargin = 10

  ctx.save()

  ctx.beginPath()
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 30
  ctx.lineCap = 'butt'
  ctx.arc(speedometerX, speedometerY, 50, Math.PI / 2, Math.PI * 2)
  ctx.stroke()
  ctx.closePath()

  const angle = Math.max(0, ((Math.PI * 1.5) / 200) * Math.min(200, point.vSpeed))

  const gradient = ctx.createLinearGradient(
    speedometerX - 50,
    speedometerY + 50,
    speedometerX + 50,
    speedometerY - 50
  )
  gradient.addColorStop(0, '#0f0')
  gradient.addColorStop(0.4, '#ff0')
  gradient.addColorStop(0.6, '#ff0')
  gradient.addColorStop(0.8, '#f00')
  gradient.addColorStop(1.0, '#f00')

  ctx.beginPath()
  ctx.strokeStyle = gradient
  ctx.arc(speedometerX, speedometerY, 50, Math.PI / 2, Math.PI / 2 + angle)
  ctx.stroke()
  ctx.closePath()

  ctx.strokeStyle

  ctx.textBaseline = 'top'
  ctx.font = '50px Arial'
  ctx.fillText(point.vSpeed, speedometerX + textMargin, speedometerY + textMargin)

  ctx.restore()
}

export const updateCardNumbers = (ctx, point, discipline) => {
  const value = point[discipline]
  const textX = 40
  const textY = 100

  ctx.save()
  ctx.fillStyle = 'white'
  ctx.fillRect(textX - 20, textY - 10, 750, 160)

  ctx.fillStyle = '#555'

  drawSpeedometer(ctx, textX, textY, point)

  ctx.font = '140px Arial'
  ctx.textBaseline = 'top'
  ctx.fillText(value || '', textX, textY)

  if (point.gpsTime + 200 > point.endTime) {
    const timeDiff = (point.gpsTime - point.endTime) / 1000
    const blur = Math.max(0, 5 - timeDiff * 10)
    if (blur > 0) {
      ctx.shadowBlur = blur
      ctx.shadowColor = '#59C3C3'
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 1
      ctx.fillStyle = '#59C3C3'
      ctx.fillText(value || '', textX, textY)
    }
  }

  ctx.restore()
}

export const drawCard = (ctx, el, idx = 0) => {
  const boxX = 0
  const boxY = 0
  const photoRadius = 30
  const photoPadding = 20
  const colorMarkWidth = 20
  const photoX = boxX + photoPadding + colorMarkWidth
  const photoY = boxY + photoPadding
  const arcX = photoX + photoRadius
  const arcY = photoY + photoRadius

  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.14)'
  ctx.shadowBlur = 6
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 3
  ctx.fillStyle = 'white'
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight)
  ctx.restore()

  ctx.save()
  ctx.fillStyle = colors[idx]
  ctx.fillRect(boxX, boxY, colorMarkWidth, boxHeight)
  ctx.restore()

  ctx.save()
  ctx.textBaseline = 'top'
  ctx.font = '40px Arial'
  ctx.fillStyle = '#555'
  ctx.fillText(el.name, photoX + photoRadius * 2 + photoPadding, photoY + photoRadius / 3)
  ctx.restore()

  const img = new Image()
  img.src = '/images/thumb/missing.png'
  img.onload = () => {
    ctx.save()
    ctx.beginPath()
    ctx.arc(arcX, arcY, photoRadius, 0, Math.PI * 2, true)
    ctx.clip()
    ctx.drawImage(img, photoX, photoY, photoRadius * 2, photoRadius * 2)
    ctx.closePath()
    ctx.restore()
  }
}
