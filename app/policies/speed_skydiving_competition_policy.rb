class SpeedSkydivingCompetitionPolicy < ApplicationPolicy
  def create? = user.registered?

  def show? = true
end
