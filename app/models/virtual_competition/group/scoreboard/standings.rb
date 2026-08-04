class VirtualCompetition::Group::Scoreboard
  class Standings
    attr_reader :competitions, :scores_by_competition, :previous_scores_by_competition, :gender

    def initialize(competitions, scores_by_competition, previous_scores_by_competition = {}, gender: nil)
      @competitions = competitions
      @scores_by_competition = scores_by_competition
      @previous_scores_by_competition = previous_scores_by_competition
      @gender = gender
    end

    def rows = @rows ||= build_rows(qualified_scores(scores_by_competition))

    def previous_rank(profile_id)
      return if previous_scores_by_competition.empty?

      previous_rows.find { |row| row.profile_id == profile_id }&.rank
    end

    def best_result(discipline) = best_results[discipline]

    private

    def previous_rows
      @previous_rows ||= build_rows(qualified_scores(previous_scores_by_competition))
    end

    def best_results
      @best_results ||= calculate_best_results(qualified_scores(scores_by_competition))
    end

    def build_rows(qualified)
      bests = calculate_best_results(qualified)

      qualified
        .map { |profile_id, scores| Row.new(profile_id, scores, competitions, bests) }
        .sort_by { |row| -row.total_points }
        .tap { |sorted| assign_ranks(sorted) }
    end

    def qualified_scores(scores_by_competition)
      by_profile = Hash.new { |hash, key| hash[key] = {} }

      competitions.each do |discipline, competition|
        scores_by_competition.fetch(competition.id, []).each do |score|
          next if score.profile_id.nil?

          by_profile[score.profile_id][discipline] = score
        end
      end

      by_profile.select { |_profile_id, scores| complete?(scores) && matching_gender?(scores) }
    end

    def complete?(scores) = competitions.keys.all? { |discipline| scores.key?(discipline) }

    def matching_gender?(scores)
      return true if gender.blank?

      scores.each_value.first.profile&.gender == gender
    end

    def calculate_best_results(qualified)
      competitions.keys.index_with do |discipline|
        results = qualified.each_value.filter_map { |scores| scores[discipline]&.result }
        next if results.empty?

        competitions[discipline].results_sort_order == 'ascending' ? results.min : results.max
      end
    end

    def assign_ranks(rows)
      return rows if rows.empty?

      rows.first.rank = 1
      rows.each_cons(2).with_index do |(previous, current), index|
        tied = previous.total_points == current.total_points && current.total_points.positive?
        current.rank = tied ? previous.rank : index + 2
      end
    end
  end
end
