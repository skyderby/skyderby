class VirtualCompGroupPolicy < ApplicationPolicy
  def index?
    admin?
  end

  def show?
    admin?
  end
end
