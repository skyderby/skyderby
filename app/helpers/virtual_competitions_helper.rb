module VirtualCompetitionsHelper
  def competition_unit(competition)
    if competition.distance? || competition.distance_in_time? || competition.distance_in_altitude? || competition.flare?
      t('units.m')
    elsif competition.time? || competition.base_race?
      t('units.t_unit')
    elsif competition.speed?
      t('units.kmh')
    end
  end

  def competition_task(competition)
    if competition.distance?
      t('virtual_competitions.tasks.distance',
        range_from: competition.range_from,
        range_to: competition.range_to)
    elsif competition.time?
      t('virtual_competitions.tasks.time',
        range_from: competition.range_from,
        range_to: competition.range_to)
    elsif competition.speed?
      t('virtual_competitions.tasks.speed',
        range_from: competition.range_from,
        range_to: competition.range_to)
    elsif competition.distance_in_time?
      t('virtual_competitions.tasks.straightline_distance_in_time',
        parameter: competition.discipline_parameter)
    elsif competition.distance_in_altitude?
      t('virtual_competitions.tasks.distance_in_altitude',
        parameter: competition.discipline_parameter)
    elsif competition.flare?
      t('virtual_competitions.tasks.flare')
    elsif competition.base_race?
      t('virtual_competitions.tasks.base_race')
    end
  end

  def competition_place(competition)
    if competition.place
      place = competition.place.name
      place += ', ' + competition.place.country.name if competition.place.country
      t('virtual_competitions.place', place: competition.place.name)
    else
      t('virtual_competitions.place', place: t('virtual_competitions.worldwide'))
    end
  end

  def competition_suit
    if @competition.tracksuit?
      t('virtual_competitions.suit', suit: 'Tracksuits')
    elsif @competition.wingsuit?
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
