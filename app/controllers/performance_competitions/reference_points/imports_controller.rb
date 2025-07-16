class PerformanceCompetitions::ReferencePoints::ImportsController < ApplicationController
  include EventScoped

  before_action :set_event
  before_action :authorize_event_update!

  def new; end

  def create
    result = Event::ReferencePoint.import_from_csv(params[:file], @event)

    if result[:status] == :success
      render(
        turbo_stream: turbo_stream.update(
          'import-results',
          partial: 'import_success',
          locals: { logs: result[:logs] }
        )
      )
    else
      render(
        turbo_stream: turbo_stream.update(
          'import-results',
          partial: 'import_error',
          locals: { errors: result[:errors] }
        )
      )
    end
  end
end
