module Api
  module V1
    module VirtualCompetitions
      module Groups
        class CategoriesController < Api::ApplicationController
          include VirtualCompetitionGroupScoped

          def show
            group = VirtualCompetition::Group.find(params[:virtual_competition_group_id])
            suit_kind = params[:suit_kind]
            @category = build_scoreboard(group, pages: { suit_kind => params[:page] }).category(suit_kind)

            raise ActiveRecord::RecordNotFound unless @category
          end
        end
      end
    end
  end
end
