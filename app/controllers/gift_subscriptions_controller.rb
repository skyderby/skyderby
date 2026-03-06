class GiftSubscriptionsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_profile
  before_action :ensure_not_already_pro, only: [:new, :create]

  def new
    @plans = gift_plans
  end

  def create
    plan = params[:plan]
    plan_config = gift_plans.find { |p| p[:id] == plan }

    return redirect_to profile_path(@profile), alert: t('.invalid_plan') unless plan_config

    checkout_session = current_user.payment_processor.checkout(
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: plan_config[:name] },
          unit_amount: plan_config[:price]
        },
        quantity: 1
      }],
      payment_intent_data: {
        metadata: {
          type: "gift_#{plan}",
          recipient_profile_id: @profile.id.to_s
        }
      },
      success_url: success_gift_subscriptions_url(profile_id: @profile.id),
      cancel_url: new_gift_subscription_url(profile_id: @profile.id)
    )

    redirect_to checkout_session.url, allow_other_host: true, status: :see_other
  end

  def success; end

  private

  def set_profile
    @profile = Profile.find(params[:profile_id])
  end

  def ensure_not_already_pro
    return unless @profile.belongs_to_user? && @profile.owner.subscription_active?

    redirect_to profile_path(@profile), alert: t('gift_subscriptions.already_pro')
  end

  def gift_plans
    [
      { id: 'annual', name: I18n.t('gift_subscriptions.plan_annual'), price: 3000, interval: 'year',
        savings: I18n.t('subscriptions.index.save_75') },
      { id: 'lifetime', name: I18n.t('gift_subscriptions.plan_lifetime'), price: 5900, interval: nil, popular: true }
    ]
  end
end
