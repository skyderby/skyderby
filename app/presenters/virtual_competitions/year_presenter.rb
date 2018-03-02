module VirtualCompetitions
  class YearPresenter < SimpleDelegator
    attr_reader :year

    def initialize(params)
      @id = params[:virtual_competition_id]
      @page = params[:page] || 1
      @year = params[:year]

      @competition = VirtualCompetition.find(@id)

      super(competition)
    end

    def title
      VirtualCompetitions::TitlePresenter.call(competition)
    end

    def overall?
      false
    end

    def scores
      @scores ||= annual_top_scores.where(year: year)
                                   .includes(associations)
                                   .paginate(page: page, per_page: 25)
    end

    private

    attr_reader :page, :competition

    def associations
      [
        { suit: :manufacturer },
        { track: [{ place: :country }, :video] },
        :profile
      ]
    end
  end
end
