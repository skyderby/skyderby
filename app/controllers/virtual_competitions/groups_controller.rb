module VirtualCompetitions
  class GroupsController < ApplicationController
    before_action :set_group, only: [:show, :edit, :update, :destroy]

    def index
      authorize VirtualCompetition::Group

      @groups = VirtualCompetition::Group.order(:name)
    end

    def show
      authorize @group
    end

    def new
      authorize [:virtual_competition, :group]

      @group = VirtualCompetition::Group.new
    end

    def edit
      authorize @group
    end

    def create
      authorize [:virtual_competition, :group]

      @group = VirtualCompetition::Group.new(group_params)

      respond_to do |format|
        if @group.save
          format.turbo_stream { redirect_to virtual_competition_groups_path }
        else
          format.turbo_stream { respond_with_errors @group }
        end
      end
    end

    def update
      authorize @group

      respond_to do |format|
        if @group.update(group_params)
          format.turbo_stream { redirect_to virtual_competition_groups_path }
        else
          format.turbo_stream { respond_with_errors @group }
        end
      end
    end

    def destroy
      authorize @group

      respond_to do |format|
        if @group.destroy
          format.turbo_stream { redirect_to virtual_competition_groups_path }
        else
          format.turbo_stream { respond_with_errors @group }
        end
      end
    end

    private

    def set_group
      @group = VirtualCompetition::Group.find(params[:id])
    end

    def group_params
      params.require(:virtual_competition_group).permit(:name, :display_on_start_page)
    end
  end
end
