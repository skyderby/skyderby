class TerrainProfile::Share < ApplicationRecord
  belongs_to :terrain_profile
  belongs_to :user

  validates :user_id, uniqueness: { scope: :terrain_profile_id }
  validate :user_is_not_owner

  private

  def user_is_not_owner
    return if user_id.blank? || terrain_profile.blank?
    return unless terrain_profile.user_id == user_id

    errors.add(:user_id, :owner)
  end
end
