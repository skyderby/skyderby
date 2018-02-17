# == Schema Information
#
# Table name: event_lists
#
#  event_type :text
#  event_id   :integer
#  starts_at  :date
#  status     :integer
#  visibility :integer
#  profile_id :integer
#  created_at :datetime
#

class EventList < ApplicationRecord
  belongs_to :event, polymorphic: true
  belongs_to :responsible, class_name: 'User'

  enum status: [:draft, :published, :finished]
  enum visibility: [:public_event, :unlisted_event, :private_event]

  private

  def read_only?
    true
  end
end
