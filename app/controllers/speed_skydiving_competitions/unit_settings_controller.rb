class SpeedSkydivingCompetitions::UnitSettingsController < ApplicationController
  include SpeedSkydivingCompetitionScoped

  before_action :set_event
  before_action :authorize_event_access!

  AVAILABLE_UNITS = %w[metric imperial].freeze

  def update
    if AVAILABLE_UNITS.include?(params[:units])
      if (profile = Current.user&.profile)
        profile.update(speed_skydiving_units: params[:units])
      else
        session[:preferred_speed_skydiving_units] = params[:units]
      end
      Current.speed_skydiving_units = params[:units]
    end

    respond_to do |format|
      format.turbo_stream
    end
  end
end
