module Places
  class SubmissionReview < SimpleDelegator
    NEIGHBOURS_LIMIT = 5

    def tracks_count = @tracks_count ||= place.tracks.count

    def neighbours
      @neighbours ||=
        Place
        .includes(:country)
        .where(kind: place.kind)
        .where.not(id: place.id)
        .nearby(place, Place::SEARCH_RADIUS.fetch(place.kind))
        .limit(NEIGHBOURS_LIMIT)
        .to_a
    end

    def distance_to(other)
      Skyderby::Geospatial.distance_between_points(place, other).round
    end
  end
end
