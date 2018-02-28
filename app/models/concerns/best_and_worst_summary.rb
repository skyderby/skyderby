module BestAndWorstSummary
  extend ActiveSupport::Concern

  ##
  # This class represents aggregation through event tracks and provides
  # convinient methods to access best and worst results with filters
  # by round and/or section
  class ResultsSummary
    def initialize(event)
      @event = event
    end

    def best_for(round: nil, section: nil, net: false)
      summary_value = summary_value(type: :best, net: net)
      summary_key = summary_key(round: round, section: section)
      summary_section = summary_section(round: round, section: section)

      summary.dig(summary_section, summary_key, summary_value)
    end

    def worst_for(round: nil, section: nil, net: false)
      summary_value = summary_value(type: :worst, net: net)
      summary_key = summary_key(round: round, section: section)
      summary_section = summary_section(round: round, section: section)

      summary.dig(summary_section, summary_key, summary_value)
    end

    private

    attr_reader :event

    delegate :rounds, :sections, :event_tracks, to: :event

    def summary_value(type:, net:)
      summary_key = "#{type}_by_result"
      summary_key += '_net' if net
      summary_key.to_sym
    end

    def summary_key(round: nil, section: nil)
      if round && section
        "#{round.id}-#{section.id}"
      elsif round
        round.id
      elsif section
        section.id
      end
    end

    def summary_section(round: nil, section: nil)
      if round && section
        :by_rounds_and_sections
      elsif round
        :by_rounds
      elsif section
        :by_sections
      end
    end

    def summary
      @summary ||= {
        by_rounds: summary_by_rounds,
        by_sections: summary_by_sections,
        by_rounds_and_sections: summary_by_rounds_and_sections
      }
    end

    def summary_by_rounds
      rounds.each_with_object({}) do |round, memo|
        filtered_results = results_for(round: round)
        memo[round.id] = summary_row_for(filtered_results, round: round)
      end
    end

    def summary_by_sections
      sections.each_with_object({}) do |section, memo|
        filtered_results = results_for(section: section)
        memo[section.id] = summary_row_for(filtered_results, section: section)
      end
    end

    def summary_by_rounds_and_sections
      rounds_and_sections.each_with_object({}) do |(round, section), memo|
        filtered_results = results_for(round: round, section: section)
        memo["#{round.id}-#{section.id}"] = summary_row_for(filtered_results, round: round, section: section)
      end
    end

    def results_for(round: nil, section: nil)
      all_results
        .yield_self { |results| round ? results.select { |x| x.round == round } : results }
        .yield_self { |results| section ? results.select { |x| x.section == section } : results }
    end

    def summary_row_for(results, round: nil, section: nil)
      {
        round: round,
        section: section,
        best_by_result:      results.max_by(&:result),
        best_by_result_net:  results.max_by(&:result_net),
        worst_by_result:     results.min_by(&:result),
        worst_by_result_net: results.min_by(&:result_net)
      }
    end

    def all_results
      @all_results ||= event_tracks.includes(:round, competitor: :section).where(is_disqualified: false).to_a
    end

    def rounds_and_sections
      rounds.to_a.product(sections)
    end
  end

  ##
  # Method returns worst result in competition by given filters
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

  ##
  # Method returns worst result in competition by given filters
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
  def worst_result_in(round: nil, section: nil, net: false)
    results_summary.worst_for(round: round, section: section, net: net)
  end

  private

  def results_summary
    @results_summary ||= ResultsSummary.new(self)
  end
end
