module VirtualCompetitions
  class PersonDetails
    RESULTS_COUNT = 10

    def initialize(virtual_competition_id:, profile_id:)
      @virtual_competition_id = virtual_competition_id
      @profile_id = profile_id
    end

    def top_results
      @top_results ||=
        VirtualCompResult
        .joins(:track)
        .where(virtual_competition_id: virtual_competition_id,
               tracks: { profile_id: profile_id })
        .order('result DESC')
        .limit(RESULTS_COUNT)
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
  end
end
