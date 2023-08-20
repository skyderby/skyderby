# == Schema Information
#
# Table name: competitors
#
#  id         :integer          not null, primary key
#  event_id   :integer
#  user_id    :integer
#  created_at :datetime
#  updated_at :datetime
#  suit_id    :integer
#  name       :string(510)
#  section_id :integer
#  profile_id :integer
#

class Event::Competitor < ApplicationRecord
  include EventOngoingValidation, Event::Namespace, CompetitorCountry, Copyable

  belongs_to :event, touch: true
  belongs_to :section
  belongs_to :profile
  belongs_to :suit
  belongs_to :team, optional: true

  has_many :results, dependent: :restrict_with_error
  has_many :reference_point_assignments, dependent: :delete_all

  validates :suit, :event, :section, :profile, presence: true

  delegate :name, to: :profile, allow_nil: true
  delegate :name, to: :suit, prefix: true, allow_nil: true
  delegate :place, to: :event

  accepts_nested_attributes_for :profile
end
