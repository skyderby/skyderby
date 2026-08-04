module VirtualCompetitions
  module Groups
    class CategoriesController < ApplicationController
      include VirtualCompetitionGroupScoped

      def show
        group = VirtualCompetition::Group.find(params[:virtual_competition_group_id])
        authorize group, :show?

        suit_kind = params[:suit_kind]
        @category = build_scoreboard(group, pages: { suit_kind => params[:page] }).category(suit_kind)

        return head :not_found unless @category

        respond_to do |format|
          format.turbo_stream
          format.html do
            redirect_to virtual_competition_group_path(
              group,
              **scoreboard_filters,
              pages: { suit_kind => @category.page },
              anchor: "group-category-#{suit_kind}"
            )
          end
        end
      end
    end
  end
end
