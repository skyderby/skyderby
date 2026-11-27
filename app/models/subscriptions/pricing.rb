module Subscriptions
  class Pricing < SimpleDelegator
    Plan = Struct.new(:id, :price, :interval, :best_value, :savings, keyword_init: true) do
      def dollars = price / 100

      def lifetime? = interval.nil?
    end

    PLANS = [
      Plan.new(id: 'lifetime', price: 5900, interval: nil, best_value: true),
      Plan.new(id: 'annual', price: 3000, interval: 'year', savings: 75),
      Plan.new(id: 'monthly', price: 1000, interval: 'month')
    ].freeze

    def plans = PLANS

    def plans_for_tracking
      plans.to_h { |plan| [plan.id, { price: plan.price }] }
    end

    def subscription
      @subscription ||= payment_processor&.subscription
    end

    def subscribed? = subscription&.active? || false

    def free_views_limit = FreeProView.monthly_limit

    def free_views_used
      @free_views_used ||= FreeProView.monthly_usage_for(__getobj__).clamp(0, free_views_limit)
    end

    def free_views_left = free_views_limit - free_views_used

    def free_views_exhausted? = free_views_left.zero?

    def show_free_views_usage? = !subscribed? && free_views_used.positive?

    def subscribers_count
      @subscribers_count ||= Pay::Subscription.active.count +
                             Pay::Charge.where("metadata->>'type' = ?", 'lifetime').count +
                             GiftedSubscription.active.count
    end
  end
end
