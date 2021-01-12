module Events
  module SectionsHelper
    def new_section_link(event)
      link_to(new_event_section_path(event_id: event.id),
              remote: true,
              'data-params': display_event_params.to_param,
              class: 'btn btn-default') do
        concat tag.i(nil, class: 'fa fa-plus text-muted')
        concat ' '
        concat t('activerecord.models.event/section')
      end
    end

    def edit_section_link(event, section)
      link_to tag.i(nil, class: 'fas fa-pencil-alt text-muted'),
              edit_event_section_path(event, section),
              remote: true,
              'data-params': display_event_params.to_param,
              class: 'scoreboard-controls'
    end

    def move_section_upper_button(event, section)
      button_to(move_upper_event_section_path(event, section),
                remote: true,
                params: display_event_params,
                method: :patch,
                class: 'btn-link scoreboard-controls') do
        tag.i(nil, class: 'fa fa-chevron-up text-muted')
      end
    end

    def move_section_lower_button(event, section)
      button_to(move_lower_event_section_path(event, section),
                remote: true,
                params: display_event_params,
                method: :patch,
                class: 'btn-link scoreboard-controls') do
        tag.i(nil, class: 'fa fa-chevron-down text-muted')
      end
    end

    def delete_section_button(event, section)
      button_to(event_section_path(event, section),
                method: :delete,
                params: display_event_params,
                confirm: t('sections.show.delete_confirmation'),
                class: 'btn-link scoreboard-controls',
                remote: true) do
        tag.i(nil, class: 'fa fa-times text-muted')
      end
    end
  end
end
