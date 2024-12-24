module VirtualCompetitions
  class PeriodPage < SimpleDelegator
    attr_reader :interval

    def initialize(params)
      @id = params[:virtual_competition_id]
      @page = [params[:page].to_i, 1].max
      @competition = VirtualCompetition.find(@id)

      @interval = competition.intervals.find_by(slug: params[:id])

      super(competition)
    end

    def title = VirtualCompetitions::TitlePresenter.call(competition)

    def overall? = false

    def scores
      @scores ||= all_scores.paginate(page: page, per_page: 25)
    end

    def all_scores
      @all_scores ||=
        interval_top_scores
        .for(interval)
        .wind_cancellation(false)
        .includes(associations)
    end

    private

    attr_reader :page, :competition

    def associations
      [
        { suit: :manufacturer },
        { track: :video },
        { profile: :contributions }
      ]
    end
  end
end
