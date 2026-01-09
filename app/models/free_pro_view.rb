class FreeProView < ApplicationRecord
  belongs_to :user
  belongs_to :track

  validates :user_id, uniqueness: { scope: :track_id }

  scope :current_month, -> { where(created_at: Time.current.beginning_of_month..) }

  after_create_commit :schedule_tracking_job

  def self.monthly_usage_for(user)
    where(user: user).current_month.count
  end

  def self.monthly_limit
    5
  end

  def self.remaining_for(user)
    monthly_limit - monthly_usage_for(user)
  end

  private

  def schedule_tracking_job
    FreeProViewTrackingJob.perform_later(id)
  end
end
