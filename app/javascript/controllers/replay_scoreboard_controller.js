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
      this.fadeOutResult(item.cell)
      const newRow = newScoreboard.querySelector(
        `[data-competitor-id="${item.row.dataset.competitorId}"]`
      )
      this.updateRowTotals(item.row, newRow)
      await this.sleep(50)
    }
    await this.sleep(300)
    await this.animatePositionChanges(newScoreboard)
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
              newContent: newCell.innerHTML,
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
      this.fadeInResult(item.cell, item.newContent)
      this.updateRowTotals(item.row, item.newRow)
      await this.sleep(50)
    }
    await this.sleep(300)
    await this.animatePositionChanges(newScoreboard)
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

  async animatePositionChanges(newScoreboard) {
    const rows = Array.from(
      this.scoreboardTarget.querySelectorAll('tr[data-competitor-id]')
    )
    const newRows = Array.from(newScoreboard.querySelectorAll('tr[data-competitor-id]'))

    const positionChanges = rows.reduce((changes, row) => {
      const newRow = newRows.find(
        r => r.dataset.competitorId === row.dataset.competitorId
      )
      if (row.sectionRowIndex !== newRow.sectionRowIndex) {
        changes.push({ row, newIndex: newRow.sectionRowIndex })
      }

      return changes
    }, [])

    if (positionChanges.length === 0) return

    await this.fadeOutRanks()
    newScoreboard
      .querySelectorAll('td[data-rank]')
      .forEach(cell => (cell.style.opacity = '0'))

    await this.applyFlipAnimations(positionChanges)

    this.scoreboardTarget.replaceChildren(...newScoreboard.children)
    this.scoreboardTarget.dataset.untilRound = newScoreboard.dataset.untilRound

    await this.fadeInRanks()
  }

  fadeOutResult(cell) {
    cell.classList.add('result-fade-out')
    setTimeout(() => {
      cell.textContent = ''
      cell.classList.remove('result-fade-out')
    }, 300)
  }

  fadeInResult(cell, content) {
    cell.innerHTML = content
    cell.classList.add('result-fade-in')
    setTimeout(() => {
      cell.classList.remove('result-fade-in')
    }, 300)
  }

  async fadeOutRanks() {
    const cells = Array.from(
      this.scoreboardTarget.querySelectorAll('td[data-rank]')
    ).reverse()

    for (let rankCell of cells) {
      rankCell.classList.add('rank-fade-out')
      await this.sleep(50)
    }
    await this.sleep(200)
  }

  async fadeInRanks() {
    for (let rankCell of this.scoreboardTarget.querySelectorAll('td[data-rank]')) {
      rankCell.classList.remove('rank-fade-out')
      rankCell.classList.add('rank-fade-in')

      setTimeout(() => {
        rankCell.style.opacity = '1'
        rankCell.classList.remove('rank-fade-in')
      }, 300)

      await this.sleep(50)
    }
    await this.sleep(300)
  }

  async applyFlipAnimations(positionChanges) {
    for (const change of positionChanges) {
      const { row, newIndex } = change
      const initialTop = row.getBoundingClientRect().top
      const newRow = row.parentElement.querySelector(`tr:nth-child(${newIndex + 1})`)
      const newTop = newRow.getBoundingClientRect().top

      const delta = newTop - initialTop
      row.style.transform = `translateY(${delta}px)`
      await this.sleep(50)
    }

    await this.sleep(500)
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
