# == Schema Information
#
# Table name: rounds
#
#  id         :integer          not null, primary key
#  name       :string(510)
#  event_id   :integer
#  created_at :datetime
#  updated_at :datetime
#  discipline :integer
#  profile_id :integer
#

class Event::Round < ApplicationRecord
  include EventOngoingValidation, Event::Namespace

  enum discipline: { time: 0, distance: 1, speed: 2, vertical_speed: 3 }

  belongs_to :event, touch: true
  belongs_to :signed_off_by,
             class_name: 'Profile',
             foreign_key: 'profile_id',
             optional: true,
             inverse_of: false

  has_many :results, dependent: :restrict_with_error
  has_many :tracks, through: :results
  has_many :reference_point_assignments, dependent: :delete_all

  validates :event, :discipline, presence: true

  delegate :range_from, to: :event
  delegate :range_to, to: :event

  before_create :set_number

  after_update :set_tracks_visibility, if: :saved_change_to_completed_at?

  def completed = completed_at.present?

  def completed=(status)
    round_competed = ActiveModel::Type::Boolean.new.cast(status)
    self.completed_at = round_competed ? Time.zone.now : nil
  end

  def tracks_visibility = completed ? event.tracks_visibility : Track.visibilities[:private_track]

  def slug = "#{discipline}-#{number}"

  private

  def set_number
    current_number =
      event.rounds.where(discipline: discipline.to_sym).maximum(:number) || 0

    self.number = current_number + 1
  end

  def set_tracks_visibility
    tracks.find_each { |track| track.update!(visibility: tracks_visibility) }
  end

  class << self
    def by_name(name)
      task_part, number_part = name.split('-')

      discipline_id = disciplines[task_part.strip.downcase]
      number = number_part.strip

      find_by(discipline: discipline_id, number: number)
    end
  end
end
