class VirtualCompetition::Group::Scoreboard
  class Row
    attr_accessor :rank
    attr_reader :profile_id, :scores, :competitions, :best_results

    def initialize(profile_id, scores, competitions, best_results)
      @profile_id = profile_id
      @scores = scores
      @competitions = competitions
      @best_results = best_results
    end

    def profile = scores.each_value.first.profile

    def score(discipline) = scores[discipline]

    def best_in?(discipline)
      result = score(discipline)&.result
      result.present? && result == best_results[discipline]
    end

    def gap_to_best(discipline)
      result = score(discipline)&.result
      best = best_results[discipline]
      return if result.blank? || best.blank? || result == best

      result - best
    end

    def points_in_disciplines
      @points_in_disciplines ||= competitions.keys.index_with { |discipline| points_in(discipline) }
    end

    def total_points = @total_points ||= points_in_disciplines.each_value.sum.round(1)

    private

    def points_in(discipline)
      VirtualCompetition::Standing::Entry.new(
        discipline: competitions[discipline], result: score(discipline)&.result, best: best_results[discipline]
      ).points.round(1)
    end
  end
end
