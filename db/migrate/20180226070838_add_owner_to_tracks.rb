class AddOwnerToTracks < ActiveRecord::Migration[5.1]
  def up
    add_reference :tracks, :owner, polymorphic: true

    execute <<~SQL
      UPDATE tracks SET
      owner_id = user_id,
      owner_type = 'User'
      WHERE user_id IS NOT NULL
    SQL

    execute <<~SQL
      UPDATE tracks SET
      owner_id = rounds.event_id,
      owner_type = 'Event'
      FROM event_tracks
      LEFT JOIN rounds
      ON event_tracks.round_id = rounds.id
      WHERE event_tracks.track_id = tracks.id
    SQL

    execute <<~SQL
      UPDATE tracks SET
      owner_id = tournament_competitors.tournament_id,
      owner_type = 'Tournament'
      FROM tournament_match_competitors
      LEFT JOIN tournament_competitors
      ON tournament_match_competitors.tournament_competitor_id = tournament_competitors.id
      WHERE tournament_match_competitors.track_id = tracks.id
    SQL

    execute <<~SQL
      UPDATE tracks SET
      owner_id = profiles.owner_id,
      owner_type = 'User'
      FROM profiles
      WHERE tracks.profile_id = profiles.id
      AND profiles.owner_type = 'User'
      AND tracks.owner_type IS NULL
    SQL
  end

  def down
    remove_reference :tracks, :owner, polymorphic: true
  end
end
