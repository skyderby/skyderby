# == Schema Information
#
# Table name: events
#
#  id              :integer          not null, primary key
#  name            :string(255)
#  range_from      :integer
#  range_to        :integer
#  created_at      :datetime
#  updated_at      :datetime
#  status          :integer          default(0)
#  user_profile_id :integer
#  place_id        :integer
#  is_official     :boolean          default(FALSE)
#

class Event < ActiveRecord::Base
  enum status: [:draft, :published, :finished]
  enum rules: [:speed_distance_time, :fai, :hungary_boogie]

  belongs_to :responsible,
             class_name: 'UserProfile',
             foreign_key: 'user_profile_id'

  belongs_to :place

  has_many :event_organizers
  has_many :sections
  has_many :competitors
  has_many :rounds
  has_many :event_tracks, through: :rounds

  validates_presence_of :responsible, :name, :range_from, :range_to

  before_validation :check_name_and_range, on: :create

  scope :visible, -> { where('status IN (1, 2)') }
  scope :officials, -> { where(is_official: true) }
  scope :warm_ups, -> { where(is_official: false) }

  private

  def check_name_and_range
    self.name ||= Time.now.strftime('%d.%m.%Y') + ': Competition'
    self.range_from ||= 3000
    self.range_to ||= 2000
  end
end
