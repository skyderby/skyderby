class VirtualCompetitionPolicy < ApplicationPolicy
  def index? = true

  def create? = admin?

  def show? = true

  def update? = admin?

  def destroy? = admin?
end
