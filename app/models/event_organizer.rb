# == Schema Information
#
# Table name: event_organizers
#
#  id         :integer          not null, primary key
#  event_id   :integer
#  profile_id :integer
#  created_at :datetime
#  updated_at :datetime
#

class EventOrganizer < ActiveRecord::Base
  include EventOngoingValidation

  belongs_to :event
  belongs_to :profile

  validates_presence_of :event, :profile

  delegate :name, to: :profile, allow_nil: true
end
