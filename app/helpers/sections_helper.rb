module SectionsHelper
  def new_section_link(event, display_raw_results)
    link_to(new_event_section_path(event_id: @event.id),
            remote: true,
            'data-params': { 'display_raw_results' => @display_raw_results }.to_param,
            class: 'btn btn-default') do
      concat content_tag(:i, nil, class: 'fa fa-plus')
      concat t('activerecord.models.section')
    end
  end

  def edit_section_link(event, section, display_raw_results)
    link_to content_tag(:i, nil, class: 'fa fa-pencil text-muted'),
            edit_event_section_path(event, section),
            remote: true,
            'data-params': { 'display_raw_results' => display_raw_results }.to_param,
            class: 'edit-section'
  end

  def move_section_upper_button(event, section, display_raw_results)
    button_to(move_upper_event_section_path(event, section),
              remote: true,
              params: { 'display_raw_results' => display_raw_results },
              method: :patch,
              class: 'btn-link section-up') do
      content_tag(:i, nil, class: 'fa fa-chevron-up text-muted')
    end
  end

  def move_section_lower_button(event, section, display_raw_results)
    button_to(move_lower_event_section_path(event, section),
              remote: true,
              params: { 'display_raw_results' => display_raw_results },
              method: :patch,
              class: 'btn-link section-down') do
      content_tag(:i, nil, class: 'fa fa-chevron-down text-muted')
    end
  end

  def delete_section_button(event, section, display_raw_results)
    button_to(event_section_path(event, section),
              method: :delete,
              params: { 'display_raw_results' => display_raw_results },
              confirm: t('sections.show.delete_confirmation'),
              class: 'btn-link delete-section',
              remote: true) do
      content_tag(:i, nil, class: 'fa fa-times-circle text-muted')
    end
  end
end
