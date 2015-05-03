class Competitor < ActiveRecord::Base
  attr_accessor :profile_name, :profile_id

  belongs_to :event
  belongs_to :section
  belongs_to :user_profile
  belongs_to :wingsuit

  has_many :event_tracks

  validates_presence_of :user_profile, :wingsuit, :event

  before_validation :set_profile

  private

  def set_profile
    self.user_profile = 
      if profile_id.present?
        UserProfile.find profile_id
      elsif profile_name
        UserProfile.create name: profile_name
      end
  end
end
