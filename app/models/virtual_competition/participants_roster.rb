class VirtualCompetition::ParticipantsRoster
  attr_reader :competition

  def initialize(competition)
    @competition = competition
  end

  def participants
    @participants ||=
      competition
      .participants
      .includes(profile: [:country, { userpic_attachment: :blob }])
      .joins(:profile)
      .order('profiles.name')
      .to_a
  end

  def standing_for(participant) = standings[participant.profile_id]

  def scored_tracks_count(participant) = scored_tracks_counts.fetch(participant.profile_id, 0)

  private

  def standings
    @standings ||= competition.standings.index_by(&:profile_id)
  end

  def scored_tracks_counts
    @scored_tracks_counts ||=
      competition.results.wind_cancellation(false).joins(:track).group('tracks.profile_id').distinct.count(:track_id)
  end
end
