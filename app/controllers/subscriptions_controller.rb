class SubscriptionsController < ApplicationController
  before_action :authenticate_user!

  def index
    @pricing = Subscriptions::Pricing.new(current_user)
  end

  def create
    plan = params[:plan]
    price_id = Rails.application.config.stripe[:prices][plan.to_sym]

    checkout_options = {
      mode: plan == 'lifetime' ? 'payment' : 'subscription',
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: success_subscriptions_url,
      cancel_url: subscriptions_url
    }

    checkout_options[:payment_intent_data] = { metadata: { type: 'lifetime' } } if plan == 'lifetime'

    checkout_session = current_user.payment_processor.checkout(**checkout_options)

    redirect_to checkout_session.url, allow_other_host: true, status: :see_other
  end

  def success; end

  def billing_portal
    portal_session = current_user.payment_processor.billing_portal(
      return_url: subscriptions_url
    )
    redirect_to portal_session.url, allow_other_host: true, status: :see_other
  end
end
