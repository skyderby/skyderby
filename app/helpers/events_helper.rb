module EventsHelper
  def edit_event_link(event)
    link_to(edit_event_path(@event),
            remote: true,
            'data-params': display_event_params.to_param,
            class: 'btn btn-default edit-event') do
      concat content_tag('i', nil, class: 'fa fa-fw fa-pencil text-muted')
      concat t('general.edit')
    end
  end

  def display_event_form_params
    capture do
      display_event_params.each do |key, value|
        concat hidden_field_tag key, value
      end
    end
  end
end
