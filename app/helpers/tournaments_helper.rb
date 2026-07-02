module TournamentsHelper
  STAGE_KEYS = { 0 => :finals, 1 => :semifinals, 2 => :quarterfinals }.freeze
  AVATAR_COLORS = 10

  def tournament_select_option(tournament)
    tournament ? [tournament.name, tournament.id] : nil
  end

  def tournament_stage_key(order, rounds_count)
    STAGE_KEYS.fetch(rounds_count - order, :round)
  end

  def tournament_stage_name(order, rounds_count)
    key = tournament_stage_key(order, rounds_count)
    return t('tournaments.bracket.stages.round', number: order) if key == :round

    t("tournaments.bracket.stages.#{key}")
  end

  def tournament_round_label(order)
    t('tournaments.bracket.round', number: order)
  end

  def tournament_match_label(match, index, order, rounds_count)
    return t('tournaments.bracket.match.gold_final') if match.gold_finals?
    return t('tournaments.bracket.match.bronze_final') if match.bronze_finals?

    base = tournament_stage_key(order, rounds_count) == :semifinals ? :semifinal : :heat
    t("tournaments.bracket.match.#{base}", number: index)
  end

  def tournament_competitor_avatar(competitor)
    profile = competitor.profile

    if profile.userpic.present?
      image_tag profile.userpic_url(:thumb), class: 'bracket-avatar', alt: competitor.name
    else
      content_tag :span,
                  tournament_competitor_initials(competitor.name),
                  class: "bracket-avatar bracket-avatar--c#{competitor.id % AVATAR_COLORS}"
    end
  end

  def tournament_competitor_initials(name)
    name.to_s.split.first(2).filter_map { |part| part[0] }.join.upcase
  end
end
