class Track::VideoPolicy < ApplicationPolicy
  def index? = true

  class Scope < Scope
    def resolve
      scope.joins(<<~SQL)
        INNER JOIN (#{tracks_scope.select(:id).to_sql}) AS accessible_tracks
        ON track_videos.track_id = accessible_tracks.id
      SQL
    end

    def tracks_scope
      TrackPolicy::Scope.new(user, Track.all).resolve
    end
  end
end
