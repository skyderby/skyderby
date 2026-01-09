module VirtualCompetitions
  class OverallPresenter < SimpleDelegator
    def initialize(params)
      @id = params[:virtual_competition_id]
      @page = [params[:page].to_i, 1].max

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
      @scores ||= all_scores.paginate(page: page, per_page: 25)
    end

    def all_scores
      @all_scores ||= personal_top_scores.wind_cancellation(false).includes(associations)
    end

    private

    attr_reader :page, :competition

    def associations
      [
        { suit: :manufacturer },
        { track: [{ place: :country }, :video] },
        { profile: :owner }
      ]
    end
  end
end
