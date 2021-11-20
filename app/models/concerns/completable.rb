module Completable
  extend ActiveSupport::Concern

  included do
    scope :completed, -> { where.not(completed_at: nil) }
  end

  def completed = completed_at.present?
  alias completed? completed

  def completed=(status)
    round_competed = ActiveModel::Type::Boolean.new.cast(status)
    self.completed_at = round_competed ? Time.zone.now : nil
  end
end
