module VirtualCompetitions
  class OverallPresenter < SimpleDelegator
    def initialize(params)
      @id = params[:virtual_competition_id]
      @page = params[:page] || 1

      @competition = VirtualCompetition.find(@id)

      super(competition)
    end

    def title
      VirtualCompetitions::TitlePresenter.call(competition)
    end

    def overall?
      true
    end

    def year
      nil
    end

    def interval
      nil
    end

    def scores
      @scores ||= personal_top_scores.wind_cancellation(false).includes(associations).paginate(page: page, per_page: 25)
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
