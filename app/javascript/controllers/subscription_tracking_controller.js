import { Controller } from '@hotwired/stimulus'
import amplitude from 'utils/amplitude'

export default class extends Controller {
  static targets = ['option']
  static values = {
    plans: Object
  }

  selectOption(event) {
    const planId = event.target.value
    const plan = this.plansValue[planId]
    if (!plan) return

    amplitude.track('subscription_option_selected', {
      plan_type: planId,
      plan_price: plan.price / 100
    })
  }

  startCheckout() {
    const selectedOption = this.optionTargets.find(el => el.checked)
    if (!selectedOption) return

    const planId = selectedOption.value
    const plan = this.plansValue[planId]
    if (!plan) return

    amplitude.track('checkout_started', {
      plan_type: planId,
      plan_price: plan.price / 100
    })
  }
}
