module CompetitionTrackVisibility
  extend ActiveSupport::Concern

  included do
    after_update :set_tracks_visibility, if: :saved_change_to_visibility?
  end

  def set_tracks_visibility
    tracks.update_all(visibility: tracks_visibility) # rubocop:disable Rails/SkipsModelValidations
  end

  def tracks_visibility = public_event? ? Track.visibilities[:public_track] : Track.visibilities[:unlisted_track]
end
