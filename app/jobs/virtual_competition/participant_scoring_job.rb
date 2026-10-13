class VirtualCompetition::ParticipantScoringJob < ApplicationJob
  def perform(participant_id)
    VirtualCompetition::Participant.find_by(id: participant_id)&.score_tracks
  end
end
