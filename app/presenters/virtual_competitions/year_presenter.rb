module VirtualCompetitions
  class YearPresenter < SimpleDelegator
    attr_reader :year

    def initialize(params)
      @id = params[:virtual_competition_id]
      @page = params[:page] || 1
      @year = params[:year]

      @competition = VirtualCompetition.includes(associations).find(@id)

      super(competition)
    end

    def title
      VirtualCompetitions::TitlePresenter.call(competition)
    end

    def overall?
      false
    end

    def scores
      competition.annual_top_scores.where(year: year)
    end

    private

    attr_reader :page, :competition

    def associations
      Hash[
        :annual_top_scores,
        [
          { suit: :manufacturer },
          { track: [{ place: :country }, :video] },
          :profile
        ]
      ]
    end
  end
end
