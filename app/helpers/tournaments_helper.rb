module TournamentsHelper
  def tournament_select_option(tournament)
    tournament ? [tournament.name, tournament.id] : nil
  end
end
