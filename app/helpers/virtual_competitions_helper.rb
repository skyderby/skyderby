module VirtualCompetitionsHelper
  def competition_unit(competition)
    untis_for_discipline = {
      distance: t('units.m'),
      distance_in_time: t('units.m'),
      distance_in_altitude: t('units.m'),
      flare: t('units.m'),
      time: t('units.t_unit'),
      base_race: t('units.t_unit'),
      speed: t('units.kmh')
    }.with_indifferent_access

    untis_for_discipline[competition.discipline]
  end

  def competition_task(competition)
    task_descriptions = {
      distance: t('virtual_competitions.tasks.distance'),
      time: t('virtual_competitions.tasks.time'),
      speed: t('virtual_competitions.tasks.speed'),
      flare: t('virtual_competitions.tasks.flare'),
      base_race: t('virtual_competitions.tasks.base_race'),
      distance_in_time:
        t('virtual_competitions.tasks.straightline_distance_in_time', parameter: competition.discipline_parameter),
      distance_in_altitude:
        t('virtual_competitions.tasks.distance_in_altitude', parameter: competition.discipline_parameter)
    }.with_indifferent_access

    task_descriptions[competition.discipline]
  end

  def competition_place(competition)
    if competition.place
      t('virtual_competitions.place', place: competition.place.name)
    else
      t('virtual_competitions.place', place: t('virtual_competitions.worldwide'))
    end
  end

  def competition_suit(competition)
    if competition.tracksuit?
      t('virtual_competitions.suit', suit: 'Tracksuits')
    elsif competition.wingsuit?
      t('virtual_competitions.suit', suit: 'Wingsuits')
    end
  end

  def format_result(result, competition)
    if competition.distance? || competition.distance_in_time? || competition.distance_in_altitude?
      result.round
    else
      result.round(1)
    end
  end
end
