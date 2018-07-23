module SectionsHelper
  def new_section_link(event)
    link_to(new_event_section_path(event_id: @event.id),
            remote: true,
            'data-params': display_event_params.to_param,
            class: 'btn btn-default') do
      concat content_tag(:i, nil, class: 'fa fa-plus text-muted')
      concat ' '
      concat t('activerecord.models.section')
    end
  end

  def edit_section_link(event, section)
    link_to content_tag(:i, nil, class: 'fa fa-pencil text-muted'),
            edit_event_section_path(event, section),
            remote: true,
            'data-params': display_event_params.to_param,
            class: 'section__control'
  end

  def move_section_upper_button(event, section)
    button_to(move_upper_event_section_path(event, section),
              remote: true,
              params: display_event_params,
              method: :patch,
              class: 'btn-link section__control') do
      content_tag(:i, nil, class: 'fa fa-chevron-up text-muted')
    end
  end

  def move_section_lower_button(event, section)
    button_to(move_lower_event_section_path(event, section),
              remote: true,
              params: display_event_params,
              method: :patch,
              class: 'btn-link section__control') do
      content_tag(:i, nil, class: 'fa fa-chevron-down text-muted')
    end
  end

  def delete_section_button(event, section)
    button_to(event_section_path(event, section),
              method: :delete,
              params: display_event_params,
              confirm: t('sections.show.delete_confirmation'),
              class: 'btn-link section__control',
              remote: true) do
      content_tag(:i, nil, class: 'fa fa-times text-muted')
    end
  end
end
