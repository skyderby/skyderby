# == Schema Information
#
# Table name: event_organizers
#
#  id              :integer          not null, primary key
#  event_id        :integer
#  user_profile_id :integer
#  created_at      :datetime
#  updated_at      :datetime
#

class EventOrganizer < ActiveRecord::Base
  belongs_to :event
  belongs_to :user_profile

  validates :event, presence: true
  validates :user_profile, presence: true
end
