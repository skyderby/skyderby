class VirtualCompetition::TopEntry < ApplicationRecord
  SIZE = 10

  belongs_to :virtual_competition
  belongs_to :track
  belongs_to :profile

  def self.record(track)
    year = track.recorded_at.year
    return unless track.public_track? && track.pilot && year == Time.zone.today.year

    competition_ids = track.virtual_competition_results.select(:virtual_competition_id)
    VirtualCompetition.listed.active.where(id: competition_ids).find_each do |competition|
      record_in(competition, track, year)
    end
  end

  def self.record_in(competition, track, year)
    standing = competition.season_standings(year).find_by(track_id: track.id, rank: ..SIZE)
    return unless standing

    create_or_find_by!(virtual_competition: competition, track:, year:) do |entry|
      entry.profile_id = standing.profile_id
      entry.rank = standing.rank
      entry.entered_at = Time.current
    end
  end
end
