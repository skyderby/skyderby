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
  include TrackVisibility, DesignatedLane

  enum :status, { draft: 0, published: 1, finished: 2, surprise: 3 }
  enum :rules, { speed_distance_time: 0, fai: 1, hungary_boogie: 2 }
  enum :visibility, { public_event: 0, unlisted_event: 1, private_event: 2 }

  belongs_to :responsible, class_name: 'User', inverse_of: :responsible_of_events

  belongs_to :place, optional: true

  has_many :sections, -> { order(:order) }, inverse_of: :event, dependent: :restrict_with_error
  has_many :competitors, inverse_of: :event, dependent: :restrict_with_error
  has_many :rounds, -> { order(:number) }, inverse_of: :event, dependent: :restrict_with_error
  has_many :teams, dependent: :restrict_with_error
  has_many :results, through: :rounds
  has_many :reference_point_assignments, through: :rounds
  has_many :tracks, through: :results
  has_many :organizers, as: :organizable, dependent: :delete_all
  has_many :sponsors,
           -> { order(:created_at) },
           as: :sponsorable,
           dependent: :delete_all,
           inverse_of: :sponsorable

  validates :name, :range_from, :range_to, :starts_at, presence: true

  after_touch :broadcast_update

  before_create do
    self.apply_penalty_to_score = false
  end

  delegate :name, :msl, to: :place, prefix: true, allow_nil: true

  after_initialize do
    self.range_from ||= 2500
    self.range_to ||= 1500
  end

  def active? = starts_at < Time.zone.now && !finished?

  def editable?(user = Current.user) = EventPolicy.new(user, self).update?

  def deletable?(user = Current.user) = user.admin? || user == responsible

  def team_standings
    Event::TeamStandings.new(
      self,
      Events::Scoreboards::SpeedDistanceTime.new(self, Events::Scoreboards::Params.new(self, {}))
    )
  end

  def permanently_delete(including_tracks: false)
    transaction do
      tracks_to_delete = tracks.to_a

      results.to_a.each(&:destroy!)
      tracks_to_delete.each(&:destroy!) if including_tracks

      rounds.destroy_all
      competitors.destroy_all
      sections.destroy_all

      destroy!
    end
  end

  private

  def broadcast_update
    ActionCable.server.broadcast "event_updates_#{id}", {}
  end

  class << self
    def search(query)
      where('LOWER(name) LIKE ?', "%#{query.downcase}%")
    end
  end
end
