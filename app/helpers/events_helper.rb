module EventsHelper
  def event_details
    render template: 'api/events/_event.json.jbuilder',
           format: :json,
           locals: { event: @event }
  end
end
