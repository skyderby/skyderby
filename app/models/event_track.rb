require 'results_calculator'

class EventTrack < ActiveRecord::Base
  attr_accessor :track_attributes

  belongs_to :track
  belongs_to :round
  belongs_to :competitor

  validates :competitor, presence: true
  validates :round, presence: true
  validates :track, presence: true

  delegate :event, to: :round
  delegate :discipline, to: :round, prefix: true

  before_validation :create_track_from_file
  before_save :calc_result

  private

  def calc_result
    self.result = ResultsCalculator.calculate(track, round)
  end

  def create_track_from_file
    unless track_id
      return false unless check_if_file_already_used!
      create_track!(track_attributes)
    end
  end

  def check_if_file_already_used!
    track_with_same_file = Track.joins(:event_track).where(
      file_file_name: track_attributes[:file].original_filename
    ).detect { |track| track.event_track.event == event }

    if track_with_same_file
      pilot_name = track_with_same_file.pilot.name
      track_round = track_with_same_file.event_track.round
      errors.add(:base, "File already used. Pilot: #{pilot_name}, round: #{track_round.discipline.humanize} - #{track_round.name}")
    end

    errors.blank?
  end
end
