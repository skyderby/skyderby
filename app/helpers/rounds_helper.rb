module RoundsHelper
  def add_round_button(event, discipline, display_raw_results)
    button_to(t("disciplines.#{discipline}"),
              event_rounds_path(event),
              method: :post,
              remote: true,
              params: {'round[discipline]' => discipline, 'display_raw_results' => @display_raw_results},
              class: 'btn-link')
  end
end
