# == Schema Information
#
# Table name: rounds
#
#  id              :integer          not null, primary key
#  name            :string(255)
#  event_id        :integer
#  created_at      :datetime
#  updated_at      :datetime
#  discipline      :integer
#  user_profile_id :integer
#

class Round < ActiveRecord::Base
  enum discipline: [:time, :distance, :speed]

  belongs_to :event
  belongs_to :signed_off_by,
             class_name: 'UserProfile',
             foreign_key: 'user_profile_id'

  has_many :event_tracks, dependent: :restrict_with_error

  validates_presence_of :event, :discipline

  before_create :set_name

  def signed_off
    signed_off_by.present?
  end

  private

  def set_name
    # Раунды нумеруются последовательно в пределах соревнований и дисциплины
    rounds = Round.where(
      event_id: event_id,
      discipline: Round.disciplines[discipline]
    ).to_a

    current_number = rounds.map { |x| x.name.to_i }.max || 0
    self.name = (current_number + 1).to_s
  end
end
