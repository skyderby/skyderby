class Place::FinishLinePolicy < PlacePolicy
  def index?
    user.present?
  end

  def show?
    user.present?
  end
end
