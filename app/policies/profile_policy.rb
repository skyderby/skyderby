class ProfilePolicy < ApplicationPolicy
  def index? = admin?

  def update?
    admin? || owner? ||
      (record.belongs_to_event? && organizer_of_event?)
  end

  def masquerade? = admin?

  def merge? = admin?

  private

  def owner? = user && record.owner == user

  def organizer_of_event? = user.organizer_of_event?(record.owner)
end
