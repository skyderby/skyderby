class GiftedSubscription < ApplicationRecord
  belongs_to :user
  belongs_to :granted_by, class_name: 'User', optional: true

  scope :active, -> { where('expires_at IS NULL OR expires_at > ?', Time.current) }

  after_destroy :update_user_subscribed_status
  after_save :update_user_subscribed_status

  private

  def update_user_subscribed_status
    user.update!(subscribed: user.subscription_active?)
  end

  def lifetime? = expires_at.nil?

  def active? = lifetime? || expires_at > Time.current

  def status
    return 'lifetime' if lifetime?
    return 'expired' if expires_at <= Time.current

    'active'
  end
end
