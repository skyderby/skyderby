class Competitor < ActiveRecord::Base
  belongs_to :event
  belongs_to :user
  belongs_to :participation_form
  belongs_to :wingsuit
  has_many :event_tracks

  def user_name
    user.user_profile.name
  end
end
