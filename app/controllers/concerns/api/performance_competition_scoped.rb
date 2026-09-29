module Api
  module PerformanceCompetitionScoped
    extend ActiveSupport::Concern

    included do
      before_action :set_event
      helper_method :wind_cancellation?
    end

    private

    def set_event
      @event = PerformanceCompetition.includes(place: :country).find(params[:performance_competition_id])
      raise ActiveRecord::RecordNotFound unless @event.viewable?
    end

    def wind_cancellation? = @event.wind_cancellation && !ActiveModel::Type::Boolean.new.cast(params[:including_wind])

    def until_round = params[:until_round].presence&.to_i
  end
end
