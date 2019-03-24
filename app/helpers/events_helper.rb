module EventsHelper
  def edit_event_link(event)
    link_to(edit_event_path(event),
            'data-params': display_event_params.to_param,
            class: 'btn btn-default edit-event') do
      concat content_tag('i', nil, class: 'fas fa-fw fa-pencil-alt text-muted')
      concat t('general.edit')
    end
  end

  def change_event_status_button(event, status)
    button_to(t("event_status.#{status}"),
              event_path(event),
              method: :patch,
              remote: true,
              params: { 'event[status]' => status },
              class: 'btn-link')
  end

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
