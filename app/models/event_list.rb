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

  enum status: { draft: 0, published: 1, finished: 2 }
  enum visibility: { public_event: 0, unlisted_event: 1, private_event: 2 }

  private

  def read_only?
    true
  end
end
