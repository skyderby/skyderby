module Events
  module RoundsHelper
    def add_round_button(event, discipline)
      button_to(t("disciplines.#{discipline}"),
                event_rounds_path(event),
                method: :post,
                remote: true,
                params: { 'round[discipline]' => discipline }.merge(display_event_params),
                class: 'btn-link')
    end
  end
end
