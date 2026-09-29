class User::Subscription
  def initialize(user)
    @user = user
  end

  def active? = source.present?

  def source
    return @source if defined?(@source)

    @source =
      if user.admin? then 'admin'
      elsif stripe_active? then 'stripe'
      elsif app_store_purchases.any? then 'app_store'
      elsif gifted_subscriptions.any? then 'gifted'
      end
  end

  def expires_at
    case source
    when 'stripe' then stripe_expires_at
    when 'app_store' then latest_expiry(app_store_purchases)
    when 'gifted' then latest_expiry(gifted_subscriptions)
    end
  end

  private

  attr_reader :user

  def stripe_active? = user.stripe_subscription_active? || user.lifetime_subscription?

  def stripe_expires_at
    return if user.lifetime_subscription?

    stripe_subscription = user.stripe_processor&.subscription
    stripe_subscription&.ends_at || stripe_subscription&.current_period_end
  end

  def app_store_purchases = @app_store_purchases ||= user.app_store_purchases.active.to_a

  def gifted_subscriptions = @gifted_subscriptions ||= user.gifted_subscriptions.active.to_a

  def latest_expiry(records)
    expiries = records.map(&:expires_at)
    expiries.include?(nil) ? nil : expiries.max
  end
end
