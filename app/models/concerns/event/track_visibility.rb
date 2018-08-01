class Event < ApplicationRecord
  module TrackVisibility
    extend ActiveSupport::Concern

    included do
      after_save :set_tracks_visibility, on: :update, if: :saved_change_to_visibility?
    end

    def set_tracks_visibility
      tracks.update_all(visibility: tracks_visibility)
    end

    def tracks_visibility
      if public_event?
        Track.visibilities[:public_track]
      else
        Track.visibilities[:unlisted_track]
      end
    end
  end
end
