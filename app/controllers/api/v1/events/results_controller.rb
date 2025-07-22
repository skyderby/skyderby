class Api::V1::Events::ResultsController < Api::ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :authorize_event_update!, only: :create
  before_action :authorize_event_access!, only: :index

  def index
    @results = @event.results.includes(:round, competitor: :profile).chronologically
  end

  def create
    submission = PerformanceCompetition::Result::Submission.new result_params

    respond_to do |format|
      if submission.save
        format.json { @result = submission.result }
      else
        format.json do
          render template: 'errors/api_errors',
                 locals: { errors: submission.errors },
                 status: :bad_request
        end
      end
    end
  end

  private

  def set_event
    @event = PerformanceCompetition.find(params[:event_id])
  end

  def result_params
    params.permit(
      :event_id,
      :competitor_id,
      :competitor_name,
      :round_id,
      :round_name,
      :penalized,
      :penalty_size,
      :penalty_reason,
      track_attributes: [:file],
      jump_range: [:exit_time, :deploy_time],
      reference_point: [:name, :latitude, :longitude]
    )
  end
end
