module Tracks
  class ChartSettingsController < ApplicationController
    before_action :set_track

    def update
      return respond_not_authorized unless @track.viewable?

      if ChartsPreferences::AVAILABLE_UNITS.include?(params[:charts_units])
        if Current.user.registered?
          Current.user.setting.update(default_units: params[:charts_units])
        else
          session[:preferred_charts_units] = params[:charts_units]
        end
        Current.charts_units = params[:charts_units]
      end

      respond_to do |format|
        format.turbo_stream
        format.json { head :no_content }
      end
    end

    private

    def set_track
      @track = Track.find(params[:track_id])
    end

    def show_params
      params.permit(:f, :t, :charts_mode, :charts_units, 'straight-line', :compare_id)
    end
    helper_method :show_params
  end
end
