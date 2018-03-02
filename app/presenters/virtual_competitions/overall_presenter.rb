module VirtualCompetitions
  class OverallPresenter < SimpleDelegator
    def initialize(params)
      @id = params[:virtual_competition_id]
      @page = params[:page] || 1

      @competition = VirtualCompetition.includes(associations).find(@id)

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

    def scores
      competition.personal_top_scores.paginate(page: page, per_page: 25)
    end

    private

    attr_reader :page, :competition

    def associations
      Hash[
        :personal_top_scores,
        [
          { suit: :manufacturer },
          { track: [{ place: :country }, :video] },
          :profile
        ]
      ]
    end
  end
end
