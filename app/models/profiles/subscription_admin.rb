module Profiles
  class SubscriptionAdmin < SimpleDelegator
    def profile = __getobj__

    def gifted_subscriptions
      @gifted_subscriptions ||= owner.gifted_subscriptions.order(created_at: :desc)
    end

    def stripe_subscriptions
      @stripe_subscriptions ||= pay_customer&.subscriptions&.order(created_at: :desc) || []
    end

    def charges
      @charges ||= pay_customer&.charges&.order(created_at: :desc) || []
    end

    def donations
      @donations ||= contributions.order(received_at: :desc)
    end

    private

    def pay_customer
      return @pay_customer if defined?(@pay_customer)

      @pay_customer = owner.stripe_processor
    end
  end
end
