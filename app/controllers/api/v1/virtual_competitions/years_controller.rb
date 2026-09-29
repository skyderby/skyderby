module Api
  module V1
    module VirtualCompetitions
      class YearsController < Api::ApplicationController
        include Api::VirtualCompetitionRankingScoped

        def show
          year = params[:year].to_i
          raise ActiveRecord::RecordNotFound unless competition.annual? && competition.years.include?(year)

          scores = VirtualCompetition::AnnualTopScore
                   .for_competition(competition)
                   .for_year(year)
                   .includes(ASSOCIATIONS)
          @ranking = highlight(competition.annual_ranking(scores, year:, **ranking_params))
        end
      end
    end
  end
end
