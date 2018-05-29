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
  include BestAndWorstSummary

  enum status: [:draft, :published, :finished]
  enum rules: [:speed_distance_time, :fai, :hungary_boogie]
  enum visibility: [:public_event, :unlisted_event, :private_event]

  belongs_to :responsible, class_name: 'User', inverse_of: :responsible_of_events

  belongs_to :place, optional: true

  has_many :organizers, as: :organizable, dependent: :delete_all
  has_many :sections, -> { order(:order) }
  has_many :competitors
  has_many :rounds, -> { order(:number) }, inverse_of: :event
  has_many :event_tracks, through: :rounds
  has_many :tracks, through: :event_tracks
  has_many :sponsors, -> { order(:created_at) }, as: :sponsorable, dependent: :delete_all

  validates :responsible, :name, :range_from, :range_to, :starts_at, presence: true

  before_validation :check_name_and_range, on: :create
  after_save :set_tracks_visibility, on: :update, if: :saved_change_to_visibility?

  after_touch :broadcast_update

  delegate :name, :msl, to: :place, prefix: true, allow_nil: true

  after_initialize do
    self.range_from ||= 3000
    self.range_to ||= 2000
  end

  def rounds_by_discipline
    @rounds_by_discipline ||= rounds.order(:created_at).group_by(&:discipline)
  end

  def tracks_visibility
    if public_event?
      Track.visibilities[:public_track]
    else
      Track.visibilities[:unlisted_track]
    end
  end

  def active?
    starts_at < Time.now && !finished?
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

  def broadcast_update
    ActionCable.server.broadcast "event_updates_#{id}", {}
  end

  class << self
    def search(query)
      where('LOWER(name) LIKE ?', "%#{query.downcase}%")
    end
  end
end
