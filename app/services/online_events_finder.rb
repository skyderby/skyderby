class OnlineEventsFinder
  def initialize(track)
    @track = track
  end

  def execute
    return [] unless available_for_scoring

    VirtualCompetition.order(:name)
                      .by_activity(track.kind)
                      .by_suit_type(track.suit_kind)
                      .for_place(track.place)
                      .for_date(track.recorded_at)
  end

  private

  attr_reader :track

  def available_for_scoring
    track.public_track? &&
      track.suit &&
      track.pilot &&
      !track.disqualified_from_online_competitions
  end
end
