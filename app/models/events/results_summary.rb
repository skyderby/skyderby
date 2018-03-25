# frozen_string_literal: true

##
# This class represents aggregation through event tracks and provides
# convinient methods to access best and worst results with filters
# by round and/or section
module Events
  class ResultsSummary
    def initialize(event)
      @event = event
    end

    def best_for(round: nil, section: nil, net: false)
      summary_path = summary_path(round, section, net, type: :best)
      summary.dig(*summary_path)
    end

    def worst_for(round: nil, section: nil, net: false)
      summary_path = summary_path(round, section, net, type: :worst)
      summary.dig(*summary_path)
    end

    private

    attr_reader :event

    delegate :rounds, :sections, :event_tracks, to: :event

    def summary_path(round, section, net, type:)
      summary_value   = summary_value(type, net)
      summary_key     = summary_key(round, section)
      summary_section = summary_section(round, section)

      [summary_section, summary_key, summary_value]
    end

    ##
    # returns one following possible variants:
    # - best_by_result
    # - best_by_result_net
    # - worst_by_result
    # - worst_by_result_net
    def summary_value(type, net)
      parts = []
      parts << type
      parts << '_by_result'
      parts << '_net' if net

      parts.join('').to_sym
    end

    def summary_key(round = nil, section = nil)
      if round && section
        "#{round.id}-#{section.id}"
      elsif round
        round.id
      elsif section
        section.id
      end
    end

    def summary_section(round = nil, section = nil)
      if round && section
        :by_rounds_and_sections
      elsif round
        :by_rounds
      elsif section
        :by_sections
      end
    end

    ##
    # Summary have following structure:
    # {
    #   by_rounds: {
    #     [round_id]: summary_row
    #     ...
    #   },
    #   by_sections: {
    #     [section_id]: summary_row
    #     ...
    #   },
    #   by_rounds_and_sections: {
    #     "[round_id]-[section_id]": summary_row
    #     ...
    #   }
    # }
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
        .select { |record| record.result.to_i > 0 }
        .yield_self { |results| round ? results.select { |x| x.round == round } : results }
        .yield_self { |results| section ? results.select { |x| x.section == section } : results }
    end

    def summary_row_for(results, round: nil, section: nil)
      {
        round: round,
        section: section,
        best_by_result:      results.max_by { |x| x.final_result },
        best_by_result_net:  results.max_by { |x| x.final_result(net: true) },
        worst_by_result:     results.min_by { |x| x.final_result },
        worst_by_result_net: results.min_by { |x| x.final_result(net: true) }
      }
    end

    def all_results
      @all_results ||= event_tracks.includes(:round, competitor: :section).to_a
    end

    def rounds_and_sections
      rounds.to_a.product(sections)
    end
  end
end
