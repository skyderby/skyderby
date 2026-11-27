import { Controller } from '@hotwired/stimulus'
import amplitude from 'utils/amplitude'

export default class extends Controller {
  static targets = ['option', 'submit']
  static values = {
    plans: Object
  }

  connect() {
    this.updateSubmitLabel()
  }

  selectOption(event) {
    this.updateSubmitLabel()

    const planId = event.target.value
    const plan = this.plansValue[planId]
    if (!plan) return

    amplitude.track('subscription_option_selected', {
      plan_type: planId,
      plan_price: plan.price / 100
    })
  }

  startCheckout() {
    const selectedOption = this.selectedOption
    if (!selectedOption) return

    const planId = selectedOption.value
    const plan = this.plansValue[planId]
    if (!plan) return

    amplitude.track('checkout_started', {
      plan_type: planId,
      plan_price: plan.price / 100
    })
  }

  updateSubmitLabel() {
    const label = this.selectedOption?.dataset.submitLabel
    if (this.hasSubmitTarget && label) this.submitTarget.textContent = label
  }

  get selectedOption() {
    return this.optionTargets.find(el => el.checked)
  }
}
