# == Schema Information
#
# Table name: competitors
#
#  id              :integer          not null, primary key
#  event_id        :integer
#  user_id         :integer
#  created_at      :datetime
#  updated_at      :datetime
#  wingsuit_id     :integer
#  name            :string(255)
#  section_id      :integer
#  user_profile_id :integer
#

class Competitor < ActiveRecord::Base
  attr_accessor :profile_name, :profile_id

  belongs_to :event
  belongs_to :section
  belongs_to :user_profile
  belongs_to :wingsuit

  has_many :event_tracks, dependent: :restrict_with_error

  validate :validate_profile
  validates_presence_of :wingsuit, :event

  before_save :set_profile

  private

  def validate_profile
    errors.add(:user_profile, :blank) if profile_id.blank? && profile_name.blank?
  end

  def set_profile
    self.user_profile =
      if profile_id.present?
        UserProfile.find profile_id
      elsif profile_name
        UserProfile.create name: profile_name
      end
  end
end
