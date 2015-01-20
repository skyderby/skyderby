class Competitor < ActiveRecord::Base
  belongs_to :event
  belongs_to :section
  belongs_to :user_profile
  belongs_to :wingsuit
  has_many :event_tracks

  before_validation :set_profile
  validates_presence_of :user_profile, :wingsuit, :event

  attr_accessor :profile_name, :profile_id

  private

  def set_profile
    if profile_id
      self.user_profile = UserProfile.find(profile_id)
    elsif profile_name
      self.user_profile = UserProfile.create! name: profile_name
    end
  end
end
