module Place::FinishLine::Permissions
  extend ActiveSupport::Concern

  class_methods do
    def creatable?(user = Current.user) = Place.creatable?(user)
  end

  def viewable?(_user = Current.user) = true

  def editable?(user = Current.user) = Place.creatable?(user)

  alias deletable? editable?
end
