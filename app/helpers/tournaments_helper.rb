module TournamentsHelper
  def qualification_results
    results = []
    @tournament.tournament_competitors.each do |competitor|
      competitor_result = {
        id: competitor.id,
        name: competitor.name,
        user_profile_id: competitor.user_profile_id
      }
      competitor_jump_results = []
      @tournament.qualification_rounds.each do |q_round|
        q_jump = @tournament.qualification_jumps.detect do |jump|
          jump.qualification_round_id == q_round.id &&
          jump.tournament_competitor_id == competitor.id
        end

        next unless q_jump

        competitor_jump_results << q_jump.result
        competitor_result["round_#{q_round.order}"] = q_jump.result
        competitor_result["round_#{q_round.order}_track_id"] = q_jump.track_id
      end
      competitor_result[:best_result] = competitor_jump_results.min
      results << competitor_result
    end

    results.sort_by { |x| x[:best_result] || 999 }
  end
end
