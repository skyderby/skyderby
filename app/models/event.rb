# == Schema Information
#
# Table name: events
#
#  id                          :integer          not null, primary key
#  name                        :string(510)
#  range_from                  :integer
#  range_to                    :integer
#  created_at                  :datetime
#  updated_at                  :datetime
#  status                      :integer          default("draft")
#  profile_id                  :integer
#  place_id                    :integer
#  is_official                 :boolean
#  rules                       :integer          default("speed_distance_time")
#  starts_at                   :date
#  wind_cancellation           :boolean          default(FALSE)
#  visibility                  :integer          default("public_event")
#  number_of_results_for_total :integer
#  responsible_id              :integer
#

class Event < ApplicationRecord
  enum :status, { draft: 0, published: 1, finished: 2, surprise: 3 }
  enum :rules, { speed_distance_time: 0, fai: 1, hungary_boogie: 2 }
  enum :visibility, { public_event: 0, unlisted_event: 1, private_event: 2 }

  belongs_to :place, optional: true

  belongs_to :responsible, class_name: 'User', inverse_of: :responsible_of_events
  has_many :organizers, as: :organizable, dependent: :delete_all
  has_many :sponsors,
           -> { order(:created_at) },
           as: :sponsorable,
           dependent: :delete_all,
           inverse_of: :sponsorable
  has_one :gps_recordings_archive, as: :event, dependent: :destroy

  validates :name, :range_from, :range_to, :starts_at, presence: true

  before_create do
    self.apply_penalty_to_score = false
  end

  delegate :name, :msl, to: :place, prefix: true, allow_nil: true

  after_initialize do
    self.range_from ||= 2500
    self.range_to ||= 1500
  end

  def active? = starts_at < Time.zone.now && !finished?

  class << self
    def search(query)
      where('LOWER(name) LIKE ?', "%#{query.downcase}%")
    end
  end
end
