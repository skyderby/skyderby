class Track::Debrief::Catalog
  attr_reader :track, :viewer

  def initialize(track, viewer:)
    @track = track
    @viewer = viewer
  end

  def disciplines
    @disciplines ||= competitions
                     .group_by { |competition| Track::Debrief::Discipline.parts_of(competition) }
                     .map { |parts, grouped| Track::Debrief::Discipline.new(parts, grouped) }
                     .select(&:supported?)
                     .filter_map { |discipline| in_debrief_window(discipline) }
                     .sort_by(&:key)
  end

  def find(key) = disciplines.find { |discipline| discipline.key == key }

  delegate :any?, to: :disciplines

  private

  def in_debrief_window(discipline)
    return discipline unless discipline.window_part&.performance?

    window = Track::Debrief::Discipline::DEBRIEF_WINDOW
    discipline.with_window(window[:from_altitude]) if reaches?(window)
  end

  def reaches?(window)
    bounds = track.altitude_bounds
    bounds[:max_altitude] >= window[:from_altitude] && bounds[:min_altitude] <= window[:to_altitude]
  end

  def competitions
    VirtualCompetition
      .active
      .by_activity(track.kind)
      .by_suit_type(track.suit_kind)
      .for_place(track.place)
      .includes(:disciplines, :finish_line)
      .order(:name)
      .select { |competition| competition.viewable?(viewer) }
  end
end
