class SubscriptionStatusJob < ApplicationJob
  def perform
    User.transaction do
      User.where(id: subscribed_user_ids).update_all(subscribed: true) # rubocop:disable Rails/SkipsModelValidations
      User.where.not(id: subscribed_user_ids).update_all(subscribed: false) # rubocop:disable Rails/SkipsModelValidations
    end
  end

  private

  def subscribed_user_ids
    @subscribed_user_ids ||= stripe_subscribers + gifted_subscribers + lifetime_subscribers + admin_ids
  end

  def stripe_subscribers
    Pay::Subscription
      .where(status: %w[active trialing])
      .joins(:customer)
      .where(pay_customers: { owner_type: 'User' })
      .pluck('pay_customers.owner_id')
  end

  def gifted_subscribers
    GiftedSubscription.active.pluck(:user_id)
  end

  def lifetime_subscribers
    Pay::Charge
      .joins(:customer)
      .where(pay_customers: { owner_type: 'User' })
      .where("pay_charges.metadata->>'type' = 'lifetime'")
      .pluck('pay_customers.owner_id')
  end

  def admin_ids
    User.admins.pluck(:id)
  end
end

Sidekiq::Cron::Job.create(
  name: 'Update subscription statuses - daily',
  cron: '0 1 * * *',
  class: 'SubscriptionStatusJob'
)
