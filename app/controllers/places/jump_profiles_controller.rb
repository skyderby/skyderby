module Places
  class JumpProfilesController < ApplicationController
    before_action :set_place
    before_action :authorize_action, except: :index

    def index
      @jump_profiles = @place.jump_lines
    end

    def new
      @jump_profile = @place.jump_lines.new
    end

    def edit
      @jump_profile = @place.jump_lines.find(params[:id])
    end

    def create
      jump_profile = @place.jump_lines.new(jump_line_params)

      respond_to do |format|
        if jump_profile.save
          format.js { redirect_to place_jump_profiles_path(@place) }
        else
          format.js do
            render template: 'errors/ajax_errors',
                   locals: { errors: jump_profile.errors },
                   status: :unprocessable_entity
          end
        end
      end
    end

    def update
      jump_profile = @place.jump_lines.find(params[:id])

      respond_to do |format|
        if jump_profile.update(jump_line_params)
          format.js { redirect_to place_jump_profiles_path(@place) }
        else
          format.js do
            render template: 'errors/ajax_errors',
                   locals: { errors: jump_profile.errors },
                   status: :unprocessable_entity
          end
        end
      end
    end

    private

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
