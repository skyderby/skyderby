module TournamentsHelper
  def match_slot_presentation(slot)
    "#{t('activerecord.models.event_track')}: #{slot.competitor_name} | Round - #{slot.round_order}"
  end

  def qualification_results
    results = []
    @tournament.competitors.each do |competitor|
      competitor_result = {
        id: competitor.id,
        name: competitor.name,
        competitor: competitor,
        profile_id: competitor.profile_id
      }
      competitor_jump_results = []
      @tournament.qualification_rounds.each do |q_round|
        q_jump = @tournament.qualification_jumps.detect do |jump|
          jump.qualification_round_id == q_round.id &&
          jump.competitor_id == competitor.id
        end

        next unless q_jump

        competitor_jump_results << q_jump.result
        competitor_result["round_#{q_round.order}"] = q_jump.result
        competitor_result["round_#{q_round.order}_canopy_time"] = q_jump.canopy_time
        competitor_result["round_#{q_round.order}_track_id"] = q_jump.track_id
        competitor_result["round_#{q_round.order}_result_id"] = q_jump.id
      end
      competitor_result[:best_result] = competitor_jump_results.compact.min
      results << competitor_result
    end

    results.sort_by do |x|
      if x[:competitor].is_disqualified
        999
      else
        x[:best_result] || 999
      end
    end
  end
end
