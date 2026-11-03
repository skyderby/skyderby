module Logbook
  class JumpsController < ApplicationController
    include LogbookScoped

    before_action :set_jump, only: %i[edit update destroy]

    def new
      @jump = Profiles::Logbook.new(logbook_profile, kind: params[:kind]).new_entry
    end

    def edit; end

    def create
      @jump = logbook_profile.jumps.new(jump_params)
      @jump.kind = Profiles::Logbook.new(logbook_profile, kind: params.dig(:jump, :kind)).kind

      if @jump.save
        redirect_to logbook_path(kind: @jump.kind)
      else
        render :new, status: :unprocessable_content
      end
    end

    def update
      if @jump.update(jump_params)
        redirect_to logbook_path(kind: @jump.kind)
      else
        render :edit, status: :unprocessable_content
      end
    end

    def destroy
      @jump.discard
      redirect_to logbook_path(kind: @jump.kind)
    end

    private

    def set_jump
      @jump = logbook_profile.jumps.kept.find(params[:id])
    end

    def jump_params
      params.require(:jump).permit(
        :number, :jumped_at, :place_id, :place_name, :suit_id, :equipment, :jump_type, :aircraft, :object_type,
        :wind_strength, :wind_direction, :exit_altitude, :deployment_altitude, :freefall_seconds, :canopy_seconds,
        :shared_with, :notes
      )
    end
  end
end
