module CompetitorsHelper
  def new_competitor_link(event)
    link_to(new_event_competitor_path(event),
            remote: true,
            'data-params': display_event_params.to_param,
            class: 'btn btn-default') do
      concat content_tag(:i, nil, class: 'fa fa-plus text-muted')
      concat ' '
      concat t('activerecord.models.event/competitor')
    end
  end

  def edit_competitor_link(event, competitor)
    link_to content_tag(:i, nil, class: 'fas fa-pencil-alt text-gray'),
            edit_event_competitor_path(event, competitor),
            remote: true,
            'data-params': display_event_params.to_param,
            class: 'btn-link competitor__control'
  end

  def delete_competitor_button(event, competitor)
    button_to event_competitor_path(event, competitor),
              method: :delete,
              remote: true,
              params: display_event_params,
              class: 'btn-link competitor__control' do
      content_tag(:i, nil, class: 'fa fa-times text-gray')
    end
  end
end
