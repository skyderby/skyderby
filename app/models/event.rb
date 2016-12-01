# == Schema Information
#
# Table name: events
#
#  id                :integer          not null, primary key
#  name              :string(510)
#  range_from        :integer
#  range_to          :integer
#  created_at        :datetime
#  updated_at        :datetime
#  status            :integer          default(0)
#  profile_id        :integer
#  place_id          :integer
#  is_official       :boolean
#  rules             :integer          default(0)
#  starts_at         :date
#  wind_cancellation :boolean
#

class Event < ApplicationRecord
  enum status: [:draft, :published, :finished]
  enum rules: [:speed_distance_time, :fai, :hungary_boogie]

  belongs_to :responsible,
             class_name: 'Profile',
             foreign_key: 'profile_id'

  belongs_to :place

  has_many :event_organizers
  has_many :sections, -> { order(:order) }
  has_many :competitors
  has_many :rounds
  has_many :event_tracks, through: :rounds
  has_many :sponsors, as: :sponsorable
  has_many :weather_data, as: :weather_datumable

  validates_presence_of :responsible, :name, :range_from, :range_to, :starts_at

  before_validation :check_name_and_range, on: :create

  delegate :name, to: :place, prefix: true, allow_nil: true
  delegate :msl, to: :place, prefix: true, allow_nil: true

  scope :visible, -> { where('status IN (1, 2)') }
  scope :officials, -> { where(is_official: true) }
  scope :warm_ups, -> { where(is_official: false) }

  def rounds_by_discipline
    @rounds_by_discipline ||= rounds.group_by(&:discipline)
  end

  private

  def check_name_and_range
    self.name ||= Time.now.strftime('%d.%m.%Y') + ': Competition'
    self.range_from ||= 3000
    self.range_to ||= 2000
  end
end
