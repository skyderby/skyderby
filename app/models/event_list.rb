# == Schema Information
#
# Table name: event_lists
#
#  event_type     :text
#  event_id       :integer
#  starts_at      :date
#  status         :integer
#  visibility     :integer
#  responsible_id :integer
#  created_at     :datetime
#

class EventList < ApplicationRecord
  belongs_to :event, polymorphic: true
  belongs_to :responsible, class_name: 'User'
  belongs_to :place, optional: true

  enum status: { draft: 0, published: 1, finished: 2 }
  enum visibility: { public_event: 0, unlisted_event: 1, private_event: 2 }
  enum rules: { speed_distance_time: 0, fai: 1, hungary_boogie: 2, single_elimination: 3 }

  def active?
    starts_at < Time.zone.now && !finished?
  end

  private

  def readonly? = true
end
