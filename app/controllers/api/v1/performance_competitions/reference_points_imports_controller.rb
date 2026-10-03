class Api::V1::PerformanceCompetitions::ReferencePointsImportsController < Api::ApplicationController
  include Api::PerformanceCompetitionScoped
  include Api::EventManagement

  def create
    result = PerformanceCompetition::ReferencePoint.import_from_csv(params.require(:file), @event)

    if result[:status] == :success
      render json: { logs: result[:logs] }
    else
      render_errors result[:errors], status: :unprocessable_content
    end
  end
end
