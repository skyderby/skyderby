module Events
  module RoundsHelper
    def add_round_button(event, discipline)
      button_to(t("disciplines.#{discipline}"),
                performance_competition_rounds_path(event),
                method: :post,
                remote: true,
                params: { 'round[discipline]' => discipline }.merge(display_event_params),
                class: 'btn-link')
    end
  end
end
