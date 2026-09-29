class Impersonation < ApplicationRecord
  DURATION = 1.hour
  SCOPES = 'read write'.freeze

  belongs_to :admin_user, class_name: 'User'
  belongs_to :user
  belongs_to :access_token, class_name: 'Doorkeeper::AccessToken', optional: true

  validate :admin_user_must_be_admin
  validate :user_must_not_be_admin
  validate :user_must_differ_from_admin

  def self.start!(admin:, user:, application:)
    impersonation = new(admin_user: admin, user:, started_at: Time.current)
    transaction do
      impersonation.validate!
      impersonation.access_token = Doorkeeper::AccessToken.create!(
        application:,
        resource_owner_id: user.id,
        resource_owner_type: user.class.polymorphic_name,
        scopes: SCOPES,
        expires_in: DURATION.to_i,
        use_refresh_token: false
      )
      impersonation.save!
    end
    impersonation
  end

  def active?
    ended_at.nil? && access_token.present? && access_token.accessible? && admin_user.admin?
  end

  def expires_at = access_token && (access_token.created_at + access_token.expires_in.seconds)

  def finish!
    transaction do
      access_token&.revoke
      update!(ended_at: Time.current) if ended_at.nil?
    end
  end

  private

  def admin_user_must_be_admin
    errors.add(:admin_user, :invalid) unless admin_user&.admin?
  end

  def user_must_not_be_admin
    errors.add(:user, 'cannot be an administrator') if user&.admin?
  end

  def user_must_differ_from_admin
    errors.add(:user, 'cannot be yourself') if user.present? && user == admin_user
  end
end
