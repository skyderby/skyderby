module Completable
  extend ActiveSupport::Concern

  def completed = completed_at.present?

  def completed=(status)
    round_competed = ActiveModel::Type::Boolean.new.cast(status)
    self.completed_at = round_competed ? Time.zone.now : nil
  end
end
