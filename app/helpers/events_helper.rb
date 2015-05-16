module EventsHelper
  def event_details
    render template: 'events/_event.json.jbuilder',
           format: :json,
           locals: { event: @event }
  end
end
