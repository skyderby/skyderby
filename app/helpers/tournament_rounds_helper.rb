module TournamentRoundsHelper
  def add_tournament_round_button(tournament)
    button_to(tournament_rounds_path(tournament_id: tournament.id),
              method: :post,
              remote: true,
              class: 'btn btn-default') do
      concat content_tag(:i, nil, class: 'fa fa-plus')
      concat ' '
      concat t('activerecord.models.tournament_round')
    end
  end
end
