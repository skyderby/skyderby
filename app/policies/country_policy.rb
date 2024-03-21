class CountryPolicy < ApplicationPolicy
  def show? = admin?
end
