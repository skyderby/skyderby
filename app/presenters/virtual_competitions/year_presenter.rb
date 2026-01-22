module VirtualCompetitions
  class YearPresenter < SimpleDelegator
    attr_reader :year

    def initialize(params)
      @id = params[:virtual_competition_id]
      @page = [params[:page].to_i, 1].max
      @year = params[:year].to_i

      @competition = VirtualCompetition.find(@id)

      super(competition)
    end

    def title = VirtualCompetitions::TitlePresenter.call(competition)

    def overall? = false

    def scores
      @scores ||= all_scores.page(page).per(25)
    end

    def all_scores
      @all_scores ||=
        VirtualCompetition::AnnualTopScore
          .for_competition(competition)
          .for_year(year)
          .includes(associations)
    end

    def current_year? = year == Date.current.year

    def show_rank_changes? = current_year?

    def previous_week_scores
      return {} unless current_year?

      @previous_week_scores ||= Rails.cache.fetch(cache_key, expires_in: 15.minutes) do
        VirtualCompetition::AnnualTopScore
          .at_snapshot(1.week.ago)
          .for_competition(competition)
          .for_year(year)
          .index_by(&:profile_id)
      end
    end

    def rank_change_for(score)
      previous = previous_week_scores[score.profile_id]
      return nil unless previous

      previous.rank - score.rank
    end

    private

    attr_reader :page, :competition

    def cache_key = "vc/#{competition.id}/annual/#{year}/previous_week_scores"

    def associations
      [
        { suit: :manufacturer },
        { track: [{ place: :country }, :video] },
        { profile: :owner }
      ]
    end
  end
end
