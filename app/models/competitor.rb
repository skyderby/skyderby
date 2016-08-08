# == Schema Information
#
# Table name: competitors
#
#  id          :integer          not null, primary key
#  event_id    :integer
#  user_id     :integer
#  created_at  :datetime
#  updated_at  :datetime
#  wingsuit_id :integer
#  name        :string(510)
#  section_id  :integer
#  profile_id  :integer
#

class Competitor < ActiveRecord::Base
  include EventOngoingValidation

  attr_accessor :profile_attributes, :profile_mode

  belongs_to :event, touch: true
  belongs_to :section
  belongs_to :profile
  belongs_to :wingsuit

  has_many :event_tracks, dependent: :restrict_with_error

  validates_presence_of :wingsuit, :event, :section, :profile

  delegate :name, to: :profile, allow_nil: true
  delegate :country_id, to: :profile, allow_nil: true
  delegate :country_name, to: :profile, allow_nil: true
  delegate :country_code, to: :profile, allow_nil: true
  delegate :name, to: :wingsuit, prefix: true, allow_nil: true

  before_validation :create_profile

  private

  def create_profile
    return if profile || profile_mode.to_sym == :select

    self.profile = Profile.create profile_attributes
  end
end
