class SubscriptionsController < ApplicationController
  before_action :authenticate_user!

  def index
    @subscription = current_user.payment_processor&.subscription
    @plans = subscription_plans
    @subscribers_count = Pay::Subscription.active.count +
                         Pay::Charge.where("metadata->>'type' = ?", 'lifetime').count +
                         GiftedSubscription.active.count
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

    if plan == 'lifetime'
      checkout_options[:payment_intent_data] = { metadata: { type: 'lifetime' } }
    end

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

  private

  def subscription_plans
    [
      { id: 'monthly', name: I18n.t('subscriptions.index.plan_monthly'), price: 1000, interval: 'month' },
      { id: 'annual', name: I18n.t('subscriptions.index.plan_annual'), price: 3000, interval: 'year', savings: I18n.t('subscriptions.index.save_75') },
      { id: 'lifetime', name: I18n.t('subscriptions.index.plan_once'), price: 5900, interval: nil, popular: true }
    ]
  end
end
