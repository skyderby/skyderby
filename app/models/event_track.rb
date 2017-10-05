# == Schema Information
#
# Table name: event_tracks
#
#  id                      :integer          not null, primary key
#  round_id                :integer
#  track_id                :integer
#  created_at              :datetime
#  updated_at              :datetime
#  competitor_id           :integer
#  result                  :decimal(10, 2)
#  profile_id              :integer
#  result_net              :decimal(10, 2)
#  is_disqualified         :boolean          default(FALSE)
#  disqualification_reason :string
#

class EventTrack < ApplicationRecord
  include EventOngoingValidation

  attr_accessor :track_attributes, :current_user, :track_from

  belongs_to :track
  belongs_to :round
  belongs_to :competitor, touch: true
  belongs_to :uploaded_by,
             class_name: 'Profile',
             foreign_key: 'profile_id'

  scope :for_round, ->(round_id) { where(round_id: round_id) }

  validates :competitor, :round, :track, presence: true
  validates :competitor_id, uniqueness: { scope: :round_id }, on: :create

  delegate :event, to: :round
  delegate :event_id, to: :round
  delegate :range_from, to: :round
  delegate :range_to, to: :round
  delegate :discipline, to: :round, prefix: true
  delegate :name, to: :round, prefix: true
  delegate :section, to: :competitor
  delegate :tracks_visibility, to: :event

  before_validation :create_track_from_file
  before_save :set_uploaded_by
  before_save :calc_result

  def points(net: false)
    result_value = result(net: net)

    return 0 if result_value.nil? || result_value.zero? || is_disqualified

    result_value / round.best_result(net: net).result(net: net) * 100
  end

  def result(net: false)
    net ? self[:result_net] : self[:result]
  end

  def best_in_round?(net: false)
    self == round.best_result(net: net)
  end

  def best_in_section?(net: false)
    self == section.best_result(net: net)
  end

  def worst_in_section?(net: false)
    self == section.worst_result(net: net)
  end

  private

  def set_uploaded_by
    self.uploaded_by ||= current_user.profile if current_user
  end

  def calc_result
    return unless track_id_changed?

    self.result = EventResultService.new(track, round).calculate

    return unless event.wind_cancellation
    self.result_net = EventResultService.new(
      track,
      round,
      wind_cancellation: true
    ).calculate
  end

  def create_track_from_file
    return if track_from == 'existing_track'

    unless track_attributes && track_attributes[:file]
      errors.add(:base, :track_file_blank)
      throw(:abort)
    end

    track_file = TrackFile.create(file: track_attributes[:file])

    throw(:abort) unless check_file_already_used(track_file)

    params = track_attributes.merge(
      user: current_user,
      track_file_id: track_file.id,
      place_id: event.place_id,
      profile_id: competitor.profile_id,
      suit_id: competitor.suit_id,
      visibility: tracks_visibility,
      comment: "#{event.name} - #{round_discipline.humanize} #{round_name}"
    ).except(:file)

    self.track = CreateTrackService.new(params).execute
  end

  def check_file_already_used(track_file)
    duplicate = duplicate_file(track_file)

    if duplicate
      track = duplicate.track
      pilot_name = track.pilot.name
      track_round = track.event_track.round
      sentence = I18n.t(
        'errors.messages.duplicate_file',
        pilot_name: pilot_name,
        round: "#{track_round.discipline.humanize} - #{track_round.name}"
      )
      errors.add(:base, sentence)
    end

    errors.blank?
  end

  def duplicate_file(track_file)
    duplicates = TrackFile
                 .joins(track: [event_track: [round: :event]])
                 .where(
                   file_file_name: track_file.file_file_name,
                   file_file_size: track_file.file_file_size
                 )
                 .where('events.id' => event_id)
                 .where.not(id: track_file.id)

    duplicates.first
  end
end
