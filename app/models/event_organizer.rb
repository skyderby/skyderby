class EventOrganizer < ActiveRecord::Base
  belongs_to :event
  belongs_to :user_profile

  validates :event, presence: true
  validates :user_profile, presence: true
end
