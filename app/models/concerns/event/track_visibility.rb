module Event::TrackVisibility
  extend ActiveSupport::Concern

  included do
    after_update :set_tracks_visibility, if: :saved_change_to_visibility?
  end

  def set_tracks_visibility
    changed_track_ids = tracks.where.not(visibility: tracks_visibility).ids
    return if changed_track_ids.empty?

    Track.where(id: changed_track_ids).update_all(visibility: tracks_visibility) # rubocop:disable Rails/SkipsModelValidations
    changed_track_ids.each { |track_id| OnlineCompetitionJob.perform_later(track_id) }
  end

  def tracks_visibility
    if public_event?
      Track.visibilities[:public_track]
    else
      Track.visibilities[:unlisted_track]
    end
  end
end
