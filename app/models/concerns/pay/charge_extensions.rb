module Pay
  module ChargeExtensions
    extend ActiveSupport::Concern

    included do
      after_save :update_owner_subscribed_status_for_lifetime
      after_destroy :update_owner_subscribed_status_for_lifetime
    end

    private

    def update_owner_subscribed_status_for_lifetime
      return unless metadata&.dig('type') == 'lifetime'

      owner = customer&.owner
      return unless owner.is_a?(User)

      owner.update!(subscribed: owner.subscription_active?)
    end
  end
end
