class EventOrganizer < ActiveRecord::Base
  belongs_to :event
  belongs_to :user_profile
end
