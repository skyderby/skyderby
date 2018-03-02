module BestAndWorstSummary
  extend ActiveSupport::Concern

  ##
  # Methods returns best and worst result (accordingly) in competition by given filters
  #
  # parameters:
  #  - round - if specified - filter by round
  #  - section - if specified - filter by section
  #  - net - true if search best based on zero wind result, false - if based on
  #          observed result
  #
  # returns:
  #   instance of EventTrack
  #
  def best_result_in(round: nil, section: nil, net: false)
    results_summary.best_for(round: round, section: section, net: net)
  end

  def worst_result_in(round: nil, section: nil, net: false)
    results_summary.worst_for(round: round, section: section, net: net)
  end

  private

  def results_summary
    @results_summary ||= Events::ResultsSummary.new(self)
  end
end
