module VirtualCompetitions
  class PeriodPage < SimpleDelegator
    attr_reader :interval

    def initialize(params)
      @id = params[:virtual_competition_id]
      @page = params[:page] || 1
      @competition = VirtualCompetition.find(@id)

      @interval = competition.intervals.find_by(slug: params[:id])

      super(competition)
    end

    def title = VirtualCompetitions::TitlePresenter.call(competition)

    def overall? = false

    def scores
      @scores ||= interval_top_scores.for(interval)
                                     .wind_cancellation(false)
                                     .includes(associations)
                                     .paginate(page: page, per_page: 25)
    end

    private

    attr_reader :page, :competition

    def associations
      [
        { suit: :manufacturer },
        { track: :video },
        :profile
      ]
    end
  end
end
