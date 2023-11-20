# == Schema Information
#
# Table name: virtual_competition_groups
#
#  id         :integer          not null, primary key
#  name       :string(510)
#  created_at :datetime
#  updated_at :datetime
#

class VirtualCompetition::Group < ApplicationRecord
  has_many :virtual_competitions, dependent: :restrict_with_error
  has_many :overall_standing_rows # rubocop:disable Rails/HasManyOrHasOneDependent
  has_many :annual_standing_rows # rubocop:disable Rails/HasManyOrHasOneDependent

  validates :name, presence: true

  def overall_standings
    OverallStandings.new(self)
  end
end
