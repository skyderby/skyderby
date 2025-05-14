module EventsHelper
  def display_event_form_params
    capture do
      display_event_params.each do |key, value|
        concat hidden_field_tag key, value
      end
    end
  end

  def event_select_option(event)
    event ? [event.name, event.id] : nil
  end
end
