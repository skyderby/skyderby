# == Schema Information
#
# Table name: event_tracks
#
#  id              :integer          not null, primary key
#  round_id        :integer
#  track_id        :integer
#  created_at      :datetime
#  updated_at      :datetime
#  competitor_id   :integer
#  result          :float(24)
#  user_profile_id :integer
#

class EventTrack < ActiveRecord::Base
  attr_accessor :track_attributes, :current_user

  belongs_to :track
  belongs_to :round
  belongs_to :competitor
  belongs_to :uploaded_by,
             class_name: 'UserProfile',
             foreign_key: 'user_profile_id'

  validates :competitor, presence: true
  validates :round, presence: true
  validates :track, presence: true

  delegate :event, to: :round
  delegate :event_id, to: :round
  delegate :discipline, to: :round, prefix: true

  before_validation :create_track_from_file
  before_save :set_uploaded_by, :calc_result

  private

  def set_uploaded_by
    self.uploaded_by ||= current_user.user_profile if current_user
  end

  def calc_result
    self.result = EventResultService.new(track, round).calculate
  end

  def create_track_from_file
    return if track_id

    track_file = TrackFile.create(file: track_attributes[:file])

    return false unless check_file_already_used(track_file)

    params = track_attributes.merge(track_file_id: track_file.id).except(:file)
    self.track = CreateTrackService.new(current_user, params, 0).execute
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
