module Place::Permissions
  extend ActiveSupport::Concern

  class_methods do
    def creatable?(user = Current.user)
      user&.role?(:edit_places) || user&.admin? || false
    end
  end

  def viewable?(_user = Current.user) = true

  def editable?(user = Current.user) = Place.creatable?(user)

  alias deletable? editable?
end
