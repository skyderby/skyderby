import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['playButton', 'roundLink', 'scoreboard']

  connect() {}

  async play() {
    if (this.isPlaying) {
      this.stop()
      return
    }

    this.isPlaying = true
    this.playButtonTarget.querySelector('span').textContent = 'Stop'

    for (const link of this.roundLinkTargets) {
      if (!this.isPlaying) break

      await this.animatedNavigateToRound(link.href, { onAdvance: () => this.sleep(1000) })
    }

    this.isPlaying = false
    this.playButtonTarget.querySelector('span').textContent = 'Play'
  }

  stop() {
    this.isPlaying = false
    this.playButtonTarget.querySelector('span').textContent = 'Play'
  }

  async goToRound(event) {
    event.preventDefault()
    if (this.isAnimating) return

    await this.animatedNavigateToRound(event.currentTarget.href)
  }

  async animatedNavigateToRound(url, { onAdvance } = {}) {
    if (this.isAnimating) return
    this.isAnimating = true

    this.disableNavigation()

    try {
      const response = await fetch(url)
      const html = await response.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      const newScoreboard = doc.querySelector('#scoreboard-time-machine table')

      if (!newScoreboard) {
        throw new Error('Scoreboard not found in response')
      }

      const targetRound = parseInt(newScoreboard.dataset.untilRound)
      const currentRound = parseInt(this.scoreboardTarget.dataset.untilRound)

      if (targetRound < currentRound) {
        await this.rollbackToScoreboard(newScoreboard)
      } else if (targetRound > currentRound) {
        await this.progressToScoreboard(newScoreboard)
      }

      this.scoreboardTarget.replaceChildren(...newScoreboard.children)
      this.scoreboardTarget.dataset.untilRound = newScoreboard.dataset.untilRound
      this.updateRoundHighlight()
      if (onAdvance) await onAdvance()

      window.history.replaceState({}, '', url)
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      this.isAnimating = false
      this.enableNavigation()
    }
  }

  async rollbackToScoreboard(newScoreboard) {
    const resultsToRemove = []
    const targetRound = parseInt(newScoreboard.dataset.untilRound)

    this.scoreboardTarget.querySelectorAll('.result-cell').forEach(cell => {
      const roundNum = parseInt(cell.dataset.round)
      if (roundNum > targetRound && cell.textContent.trim()) {
        resultsToRemove.push({
          cell,
          createdAt: Date.parse(cell.dataset.createdAt),
          row: cell.closest('tr')
        })
      }
    })

    resultsToRemove.sort((a, b) => b.createdAt - a.createdAt)

    for (const item of resultsToRemove) {
      item.cell.textContent = ''
      const newRow = newScoreboard.querySelector(
        `[data-competitor-id="${item.row.dataset.competitorId}"]`
      )
      this.updateRowTotals(item.row, newRow)
      await this.sleep(50)
    }

    await this.checkAndAnimatePositions()
  }

  async progressToScoreboard(newScoreboard) {
    const resultsToAdd = []
    const targetRound = parseInt(newScoreboard.dataset.untilRound)
    const currentRound = parseInt(this.scoreboardTarget.dataset.untilRound)

    newScoreboard.querySelectorAll('.result-cell').forEach(newCell => {
      const roundNum = parseInt(newCell.dataset.round)
      if (
        roundNum > currentRound &&
        roundNum <= targetRound &&
        newCell.textContent.trim()
      ) {
        const competitorId = newCell.closest('tr').dataset.competitorId
        const currentRow = this.scoreboardTarget.querySelector(
          `[data-competitor-id="${competitorId}"]`
        )
        if (currentRow) {
          const currentCell = currentRow.querySelector(
            `.result-cell[data-round="${roundNum}"]`
          )
          if (currentCell && !currentCell.textContent.trim()) {
            resultsToAdd.push({
              cell: currentCell,
              newContent: newCell.textContent,
              createdAt: Date.parse(newCell.dataset.createdAt),
              row: currentRow,
              newRow: newCell.closest('tr')
            })
          }
        }
      }
    })

    resultsToAdd.sort((a, b) => a.createdAt - b.createdAt)

    for (const item of resultsToAdd) {
      item.cell.textContent = item.newContent
      this.updateRowTotals(item.row, item.newRow)
      await this.sleep(50)
    }

    await this.checkAndAnimatePositions()
  }

  capturePositions() {
    const positions = new Map()

    document.querySelectorAll('#scoreboard tbody tr').forEach(row => {
      // Skip category rows
      if (row.querySelector('.category-cell')) return

      const cells = row.querySelectorAll('td')
      if (cells.length < 3) return

      // Get competitor name from the second cell
      const competitorName = cells[1].textContent.trim()
      const rank = parseInt(cells[0].textContent)

      if (competitorName && !isNaN(rank)) {
        const rect = row.getBoundingClientRect()
        positions.set(competitorName, {
          top: rect.top,
          rank: rank
        })
      }
    })

    return positions
  }

  updateRowTotals(row, newRow) {
    if (newRow) {
      const totalCell = row.querySelector('[data-total]')
      const avgCell = row.querySelector('[data-avg]')
      const newTotalCell = newRow.querySelector('[data-total]')
      const newAvgCell = newRow.querySelector('[data-avg]')

      if (totalCell && newTotalCell) {
        totalCell.textContent = newTotalCell.textContent
      }
      if (avgCell && newAvgCell) {
        avgCell.textContent = newAvgCell.textContent
      }
    }
  }

  async checkAndAnimatePositions() {
    // Get current data
    const rows = Array.from(document.querySelectorAll('#scoreboard tbody tr')).filter(
      row => !row.querySelector('.category-cell')
    )

    // Sort by total (descending)
    const sortedRows = rows.sort((a, b) => {
      const totalA =
        parseFloat(
          a.querySelectorAll('td')[a.querySelectorAll('td').length - 2].textContent
        ) || 0
      const totalB =
        parseFloat(
          b.querySelectorAll('td')[b.querySelectorAll('td').length - 2].textContent
        ) || 0
      return totalB - totalA
    })

    // Update ranks and animate if needed
    let currentRank = 1
    for (const row of sortedRows) {
      const rankCell = row.querySelector('td:first-child')
      const oldRank = parseInt(rankCell.textContent)

      if (oldRank !== currentRank) {
        rankCell.textContent = currentRank

        // Calculate position change
        const tbody = row.parentElement
        const currentIndex = Array.from(tbody.children).indexOf(row)
        const targetIndex = currentRank - 1

        if (currentIndex !== targetIndex) {
          // Move row to new position
          const targetRow = tbody.children[targetIndex]
          if (targetIndex < currentIndex) {
            tbody.insertBefore(row, targetRow)
          } else {
            tbody.insertBefore(row, targetRow.nextSibling)
          }

          // Apply animation
          this.applyFlipAnimation(row, oldRank, currentRank)
        }
      }
      currentRank++
    }
  }

  applyFlipAnimation(row, oldRank, newRank) {
    row.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'

    if (newRank < oldRank) {
      row.classList.add('moving-up')
    } else {
      row.classList.add('moving-down')
    }

    setTimeout(() => {
      row.classList.remove('moving-up', 'moving-down')
    }, 1000)
  }

  updateRoundHighlight() {
    this.roundLinkTargets.forEach(link => {
      link.classList.remove('active')
    })

    const currentRound = this.scoreboardTarget.dataset.untilRound
    const currentLink = this.roundLinkTargets.find(
      link => link.dataset.round === currentRound
    )
    if (currentLink) {
      currentLink.classList.add('active')
    }
  }

  disableNavigation() {
    this.roundLinkTargets.forEach(link => {
      link.style.pointerEvents = 'none'
    })
    if (this.hasPlayButtonTarget) {
      this.playButtonTarget.disabled = true
    }
  }

  enableNavigation() {
    this.roundLinkTargets.forEach(link => {
      link.style.pointerEvents = ''
    })
    if (this.hasPlayButtonTarget) {
      this.playButtonTarget.disabled = false
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
