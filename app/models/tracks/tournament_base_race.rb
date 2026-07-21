module Tracks
  # Adapts a tournament's qualification into a base_race "competition" so it can
  # appear in the track pro-view result dropdown alongside online ratings.
  # Base race options are selected by finish_line_id, so this id is only used to
  # mark the active dropdown item; it is namespaced to never collide with a
  # VirtualCompetition id.
  class TournamentBaseRace
    attr_reader :tournament

    delegate :name, :finish_line, :finish_line_id, to: :tournament

    def initialize(tournament)
      @tournament = tournament
    end

    def id = "tournament-#{tournament.id}"

    def discipline = 'base_race'

    def discipline_parameter = 0

    def base_race? = true

    def results = tournament.qualification_jumps

    def results_sort_order = 'ascending'

    def task = 'time'

    def comparable_in_pro_view? = true
  end
end
