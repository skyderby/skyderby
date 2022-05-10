class SpeedSkydivingCompetitionSeriesPolicy < ApplicationPolicy
  def update? = admin?
end
