module CompetitorsHelper
  def new_competitor_link(event)
    link_to(new_event_competitor_path(event),
            remote: true,
            'data-params': display_event_params.to_param,
            class: 'btn btn-default') do
      concat content_tag(:i, nil, class: 'fa fa-plus text-muted')
      concat ' '
      concat t('activerecord.models.competitor')
    end
  end

  def edit_competitor_link(event, competitor)
    link_to content_tag(:i, nil, class: 'fa fa-pencil'),
            edit_event_competitor_path(event, competitor),
            remote: true,
            'data-params': display_event_params.to_param,
            class: 'edit-competitor btn-primary'
  end

  def delete_competitor_button(event, competitor)
    button_to event_competitor_path(event, competitor),
              method: :delete,
              remote: true,
              params: display_event_params,
              class: 'delete-competitor btn-link' do
      content_tag(:i, nil, class: 'fa fa-times')
    end
  end
end
