class Ability
  include CanCan::Ability

  def initialize(user)
    can :read, Tournament

    return unless user

    can :create, Tournament
    can :edit, Tournament do |tournament|
      tournament.responsible == user.profile
    end
    cannot :edit, Tournament, responsible: nil

    # allow admins to do anything
    can :manage, :all if user.has_role? :admin
  end
end
