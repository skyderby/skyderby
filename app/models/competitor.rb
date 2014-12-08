class Competitor < ActiveRecord::Base
  belongs_to :event
  belongs_to :user
  belongs_to :wingsuit
  has_many :event_tracks

  validates_presence_of :wingsuit
  validate :user_or_name_filled

  def user_name
    if user
      user.user_profile.name
    else
      name
    end
  end

  private
  def user_or_name_filled
    if user.blank? && name.blank?
      errors.add(:base, "Specify a name or user of competitor")
    end
  end
end
