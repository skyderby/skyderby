class ProfilePolicy < ApplicationPolicy
  def index?
    admin?
  end

  def update?
    admin? || owner? ||
      (record.belongs_to_event? && organizer_of_event?)
  end

  def masquerade?
    admin?
  end

  def merge?
    admin?
  end

  def owner?
    user && record.owner == user
  end

  def organizer_of_event?
    (user.responsible_of_events + user.organizer_of_events).include?(record.owner)
  end
end
