module VirtualCompetitionsHelper
  def competition_unit
    if @competition.distance? || @competition.distance_in_time?
      t('units.m')
    elsif @competition.time?
      t('units.t_unit')
    elsif @competition.speed?
      t('units.kmh')
    end
  end
end
