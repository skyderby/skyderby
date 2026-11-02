class User::Subscription
  PLANS = {
    'io.skyderby.pro.monthly' => 'monthly',
    'io.skyderby.pro.annual' => 'annual',
    'io.skyderby.pro.lifetime' => 'lifetime'
  }.freeze

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
      elsif google_play_purchases.any? then 'google_play'
      elsif gifted_subscriptions.any? then 'gifted'
      end
  end

  def expires_at
    case source
    when 'stripe' then stripe_expires_at
    when 'app_store' then latest_expiry(app_store_purchases)
    when 'google_play' then latest_expiry(google_play_purchases)
    when 'gifted' then latest_expiry(gifted_subscriptions)
    end
  end

  def plan
    return 'lifetime' if lifetime?

    case source
    when 'app_store' then latest_plan(app_store_purchases)
    when 'google_play' then latest_plan(google_play_purchases)
    end
  end

  def lifetime?
    return false unless active?

    user.lifetime_subscription? ||
      [app_store_purchases, google_play_purchases, gifted_subscriptions].any? { |records| records.any?(&:lifetime?) }
  end

  private

  attr_reader :user

  def stripe_active? = user.stripe_subscription_active? || user.lifetime_subscription?

  def stripe_expires_at
    return if user.lifetime_subscription?

    stripe_subscription = user.stripe_processor&.subscription
    stripe_subscription&.ends_at || stripe_subscription&.current_period_end
  end

  def app_store_purchases = @app_store_purchases ||= user.app_store_purchases.entitling.to_a

  def google_play_purchases = @google_play_purchases ||= user.google_play_purchases.entitling.to_a

  def gifted_subscriptions = @gifted_subscriptions ||= user.gifted_subscriptions.active.to_a

  def latest_plan(records)
    PLANS[records.max_by { it.expires_at || Time.zone.at(0) }&.product_id]
  end

  def latest_expiry(records)
    expiries = records.map(&:expires_at)
    expiries.include?(nil) ? nil : expiries.max
  end
end
