module Tracks
  class BaseResult
    DISCIPLINES = %w[base_race distance_in_time distance_in_altitude].freeze
    NONE = 'none'.freeze

    def initialize(track, competition_id: nil, finish_line_id: nil, compare_track: nil)
      @track = track
      @competition_id = competition_id
      @finish_line_id = finish_line_id
      @compare_track = compare_track
    end

    def available?
      competitions.any?
    end

    def none?
      @competition_id == NONE
    end

    def competitions
      @competitions ||= all_competitions.uniq { |competition| group_key(competition) }
    end

    def selected
      return if none?

      @selected ||=
        selected_by_finish_line ||
        representative_for(@competition_id.presence&.to_i) ||
        competitions.first
    end

    def race?
      selected&.base_race?
    end

    def primary_value
      stored_value(@track)
    end

    def compare_value
      stored_value(@compare_track)
    end

    def primary_point
      point_for(primary_segment)
    end

    def compare_point
      point_for(compare_segment)
    end

    private

    def selected_by_finish_line
      return if @finish_line_id.blank?

      competitions.find do |competition|
        competition.base_race? && competition.finish_line_id.to_s == @finish_line_id.to_s
      end
    end

    def all_competitions
      @all_competitions ||=
        (virtual_competitions + tournament_base_races)
        .each_with_index
        .sort_by { |competition, index| [DISCIPLINES.index(competition.discipline), index] }
        .map(&:first)
    end

    def virtual_competitions
      VirtualCompetition
        .where(id: @track.virtual_competition_results.select(:virtual_competition_id))
        .where(discipline: DISCIPLINES.map { |name| VirtualCompetition.disciplines[name] })
        .distinct
        .to_a
    end

    def tournament_base_races
      Tournament
        .joins(:qualification_jumps)
        .where(qualification_jumps: { track_id: @track.id })
        .where('qualification_jumps.result > 0')
        .where.not(finish_line_id: nil)
        .distinct
        .map { |tournament| TournamentBaseRace.new(tournament) }
    end

    def group_key(competition)
      [competition.discipline, competition.discipline_parameter, competition.finish_line_id]
    end

    def representative_for(competition_id)
      return unless competition_id

      requested = all_competitions.find { |competition| competition.id == competition_id }
      return unless requested

      competitions.find { |competition| group_key(competition) == group_key(requested) }
    end

    def primary_segment
      @primary_segment ||= segment_for(@track)
    end

    def compare_segment
      return @compare_segment if defined?(@compare_segment)

      @compare_segment = @compare_track && segment_for(@compare_track)
    end

    def stored_value(track)
      return unless track && selected

      selected.results.find_by(track_id: track.id)&.result
    end

    def segment_for(track)
      return unless selected

      OnlineCompetitionsService.new(track, selected).result_segment
    rescue StandardError
      nil
    end

    def point_for(segment)
      return unless segment&.end_point

      point = segment.end_point
      { lat: point[:latitude], lon: point[:longitude], gps_time: point[:gps_time].to_f }
    end
  end
end
