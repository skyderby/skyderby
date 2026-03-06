module Pay
  module ChargeExtensions
    extend ActiveSupport::Concern

    included do
      after_save :update_owner_subscribed_status_for_lifetime
      after_save :process_gift_subscription
      after_destroy :update_owner_subscribed_status_for_lifetime
    end

    private

    def update_owner_subscribed_status_for_lifetime
      return unless metadata&.dig('type') == 'lifetime'

      owner = customer&.owner
      return unless owner.is_a?(User)

      owner.update!(subscribed: owner.subscription_active?)
    end

    def process_gift_subscription
      return unless gift_charge?

      recipient = gift_recipient
      return unless recipient

      lifetime = metadata['type'] == 'gift_lifetime'

      gifted = GiftedSubscription.create!(
        user: recipient,
        granted_by: customer&.owner,
        expires_at: lifetime ? nil : 1.year.from_now,
        reason: lifetime ? 'Gifted lifetime' : 'Gifted annual'
      )

      GiftSubscriptionMailer.gift_received(gifted).deliver_later
    end

    def gift_charge?
      metadata&.dig('type')&.start_with?('gift_')
    end

    def gift_recipient
      profile = Profile.find_by(id: metadata&.dig('recipient_profile_id'))
      profile&.owner if profile&.belongs_to_user?
    end
  end
end
