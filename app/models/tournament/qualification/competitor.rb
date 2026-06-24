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
