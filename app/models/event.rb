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
#  status            :integer          default("draft")
#  profile_id        :integer
#  place_id          :integer
#  is_official       :boolean
#  rules             :integer          default("speed_distance_time")
#  starts_at         :date
#  wind_cancellation :boolean          default(FALSE)
#  visibility        :integer          default("public_event")
#

class Event < ApplicationRecord
  enum status: [:draft, :published, :finished]
  enum rules: [:speed_distance_time, :fai, :hungary_boogie]
  enum visibility: [:public_event, :unlisted_event, :private_event]

  belongs_to :responsible,
             class_name: 'Profile',
             foreign_key: 'profile_id'

  belongs_to :place, optional: true

  has_many :event_organizers
  has_many :sections, -> { order(:order) }
  has_many :competitors
  has_many :rounds
  has_many :event_tracks, through: :rounds
  has_many :tracks, through: :event_tracks
  has_many :sponsors, -> { order(:created_at) }, as: :sponsorable, dependent: :delete_all
  has_many :weather_data, as: :weather_datumable, dependent: :delete_all

  validates :responsible, :name, :range_from, :range_to, :starts_at, presence: true

  before_validation :check_name_and_range, on: :create
  after_save :set_tracks_visibility, on: :update, if: :visibility_changed?

  delegate :name, to: :place, prefix: true, allow_nil: true
  delegate :msl, to: :place, prefix: true, allow_nil: true

  after_initialize do
    self.range_from ||= 3000
    self.range_to ||= 2000
  end

  def rounds_by_discipline
    @rounds_by_discipline ||= rounds.group_by(&:discipline)
  end

  def tracks_visibility
    if public_event?
      Track.visibilities[:public_track]
    else
      Track.visibilities[:unlisted_track]
    end
  end

  private

  def set_tracks_visibility
    tracks.update_all(visibility: tracks_visibility)
  end

  def check_name_and_range
    self.name ||= "#{Time.current.strftime('%d.%m.%Y')}: Competition"
    self.range_from ||= 3000
    self.range_to ||= 2000
  end

  class << self
    def search(query)
      where('LOWER(name) LIKE ?', "%#{query.downcase}%")
    end
  end
end
