module EventsHelper
  def event_details
    render template: 'events/_event.json.jbuilder',
           format: :json,
           locals: { event: @event }
  end

  def event_settings_modal
    render 'event_settings_modal' if can?(:update, @event)
  end

  def competitor_modal
    render 'competitor_modal' if can?(:update, @event)
  end

  def section_modal
    render 'section_modal' if can?(:update, @event)
  end

  def result_modal
    render 'result_modal' if can?(:update, @event)
  end
end
