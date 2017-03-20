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
#

class EventList < ApplicationRecord
  belongs_to :event, polymorphic: true
  belongs_to :responsible, 
             class_name: 'Profile',
             foreign_key: 'profile_id'

  enum status: [:draft, :published, :finished]
  enum visibility: [:public_event, :unlisted_event, :private_event]

  scope :visible_to_guests, -> { where('status IN (1, 2) AND visibility = 0') }
  scope :visible_to_user, ->(profile) do
    visible_to_guests
      .or(where(responsible: profile))
      .or(where(event_type: 'Event', event_id: profile.participant_of_events))
  end

  private

  def read_only?
    true
  end

  class << self
    def visible_to(user)
      return visible_to_guests unless user
      return all if user.has_role? :admin

      visible_to_user(user.profile)
    end
  end
end
