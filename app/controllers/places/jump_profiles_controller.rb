module Places
  class JumpProfilesController < ApplicationController
    before_action :set_place
    before_action :set_jump_profile, only: %i[edit update destroy]
    before_action :authorize_action, except: :index

    def index
      @jump_profiles = @place.jump_lines.order(:name).includes(:measurements)
    end

    def new
      @jump_profile = @place.jump_lines.new
    end

    def edit; end

    def create
      @jump_profile = @place.jump_lines.new(jump_line_params)

      if @jump_profile.save
        redirect_to place_jump_profiles_path(@place)
      else
        respond_with_errors(@jump_profile)
      end
    end

    def update
      if @jump_profile.update(jump_line_params)
        redirect_to place_jump_profiles_path(@place)
      else
        respond_with_errors(@jump_profile)
      end
    end

    def destroy
      if @jump_profile.destroy
        redirect_to place_jump_profiles_path(@place)
      else
        respond_with_errors(@jump_profile)
      end
    end

    private

    def set_jump_profile
      @jump_profile = @place.jump_lines.find(params[:id])
    end

    def set_place
      @place = Place.find(params[:place_id])
    end

    def authorize_action
      authorize @place, :edit?
    end

    def jump_line_params
      params.require(:jump_line).permit \
        :name,
        measurements_attributes: {}
    end
  end
end
