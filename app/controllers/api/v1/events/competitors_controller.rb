class Api::V1::Events::CompetitorsController < Api::ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :authorize_event_access!

  def index
    @competitors =
      @event.competitors
            .left_outer_joins(:category, :profile)
            .order('event_sections.order', 'profiles.name')

    respond_to do |format|
      format.json
    end
  end

  private

  def set_event
    @event = PerformanceCompetition.find(params[:event_id])
  end
end
