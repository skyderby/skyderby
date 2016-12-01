# == Schema Information
#
# Table name: tournament_rounds
#
#  id            :integer          not null, primary key
#  order         :integer
#  tournament_id :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class TournamentRound < ApplicationRecord
  belongs_to :tournament
  has_many :matches, class_name: 'TournamentMatch'
end
