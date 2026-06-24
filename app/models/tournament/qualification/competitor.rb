class Tournament::Qualification::Competitor < SimpleDelegator
  NO_RESULT = Float::INFINITY

  attr_accessor :rank

  def initialize(record, scoreboard)
    @record = record
    @scoreboard = scoreboard

    super(@record)
  end

  def ranked?
    rank.present?
  end

  def results
    @results ||= scoreboard.results_by_competitor[id] || []
  end

  def result_in_round(round)
    results.find { |result| result.round == round }
  end

  def best_result
    scored_results.min
  end

  def top_speed
    results.filter_map(&:top_speed).max
  end

  def follow_up_results
    scored_results.sort.drop(1)
  end

  def counted_jumps
    results.select { |result| counts?(result.result) }
  end

  def best_jump
    counted_jumps.min_by(&:result)
  end

  def attempt_jumps
    counted_jumps.sort_by { |jump| -(jump.round_order || 0) }
  end

  def ranking_key
    if scoreboard.show_best_result?
      [best_result || NO_RESULT]
    else
      scoreboard.completed_rounds_desc.map { |round| round_result(round) || NO_RESULT }
    end
  end

  def best_result_in?(result)
    return false unless multiple_results?

    counts?(result.result) && result.result == best_result
  end

  def multiple_results?
    scored_results.many?
  end

  private

  attr_reader :scoreboard

  def scored_results
    @scored_results ||= results.map(&:result).select { |result| counts?(result) }
  end

  def round_result(round)
    result = result_in_round(round)&.result
    result if counts?(result)
  end

  def counts?(result)
    result&.positive?
  end
end
