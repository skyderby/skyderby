module Pay
  module SubscriptionExtensions
    extend ActiveSupport::Concern

    included do
      after_save :update_owner_subscribed_status
      after_destroy :update_owner_subscribed_status
    end

    private

    def update_owner_subscribed_status
      owner = customer&.owner
      return unless owner.is_a?(User)

      owner.update!(subscribed: owner.subscription_active?)
    end
  end
end
