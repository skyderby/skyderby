module VirtualCompetitions
  class PersonDetails
    def initialize(virtual_competition_id:, profile_id:)
      @virtual_competition_id = virtual_competition_id
      @profile_id = profile_id
    end

    def top_results
      @top_results ||=
        competition.results
        .joins(:track)
        .where(tracks: { profile_id: profile_id })
        .order(results_order)
        .limit(results_count)
    end

    def chart_data
      ordered_results = top_results.sort_by { |x| x.track.recorded_at }
      ordered_results.map do |record|
        [record.track.recorded_at, record.result]
      end.to_json.html_safe
    end

    def competition
      @competition ||= VirtualCompetition.find(virtual_competition_id)
    end

    private

    attr_reader :virtual_competition_id, :profile_id

    def results_count
      10
    end

    def results_order
      direction = competition.results_sort_order == 'descending' ? 'DESC' : 'ASC'
      "result #{direction}"
    end
  end
end
