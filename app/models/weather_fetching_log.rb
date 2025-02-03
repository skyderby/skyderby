class WeatherFetchingLog < ApplicationRecord
  def self.accessible?(user = Current.user) = user.admin?

  def editable?(user = Current.user) = user.admin?
end
