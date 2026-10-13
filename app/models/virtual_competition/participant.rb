class VirtualCompetition::Participant < ApplicationRecord
  belongs_to :virtual_competition
  belongs_to :profile

  validates :profile_id, uniqueness: { scope: :virtual_competition_id }
  validate :admin_can_sign_in, if: :admin?

  scope :admins, -> { where(admin: true) }

  after_create_commit :schedule_scoring
  after_destroy :delete_results

  delegate :name, to: :profile

  def tracks_scanned? = tracks_scanned_at.present?

  def score_tracks
    tracks_in_period.find_each do |track|
      OnlineCompetitionsService.rescore(track, virtual_competition)
    end

    update!(tracks_scanned_at: Time.current)
    Turbo::StreamsChannel.broadcast_replace_to virtual_competition, :participants,
                                               target: 'participants_list',
                                               partial: 'virtual_competitions/participants/list',
                                               locals: { roster: virtual_competition.participants_roster }
  end

  private

  def admin_can_sign_in
    errors.add(:base, :admin_without_account) unless profile&.owner.is_a?(User)
  end

  def schedule_scoring = VirtualCompetition::ParticipantScoringJob.perform_later(id)

  def delete_results = virtual_competition.results.where(track_id: profile.tracks.select(:id)).delete_all

  def tracks_in_period
    from = virtual_competition.period_from&.beginning_of_day
    to = virtual_competition.period_to&.end_of_day

    profile.tracks.where(recorded_at: from..to)
  end
end
